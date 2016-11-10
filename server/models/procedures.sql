/*
  This file contains all the stored procedures used in bhima's database.  It
  should be loaded after functions.sql.
*/

DELIMITER $$

CREATE PROCEDURE StageInvoice(
  IN is_distributable TINYINT(1),
  IN date DATETIME,
  IN cost DECIMAL(19, 4) UNSIGNED,
  IN description TEXT,
  IN service_id SMALLINT(5) UNSIGNED,
  IN debtor_uuid BINARY(16),
  IN project_id SMALLINT(5),
  IN user_id SMALLINT(5),
  IN uuid BINARY(16)
)
BEGIN
  -- verify if invoice stage already exists within this connection, if the
  -- stage already exists simply write to it, otherwise create it select into it
  DECLARE `no_invoice_stage` TINYINT(1) DEFAULT 0;
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S02' SET `no_invoice_stage` = 1;
  SELECT NULL FROM `stage_invoice` LIMIT 0;

  IF (`no_invoice_stage` = 1) THEN
    CREATE temporary table stage_invoice
    (SELECT project_id, uuid, cost, debtor_uuid, service_id, user_id, date, description, is_distributable);
  ELSE
    INSERT INTO stage_invoice
    (SELECT project_id, uuid, cost, debtor_uuid, service_id, user_id, date, description, is_distributable);
  END IF;
END $$

CREATE PROCEDURE StageInvoiceItem(
  IN uuid BINARY(16),
  IN inventory_uuid BINARY(16),
  IN quantity INT(10) UNSIGNED,
  IN transaction_price decimal(19, 4),
  IN inventory_price decimal(19, 4),
  IN debit decimal(19, 4),
  IN credit decimal(19, 4),
  IN invoice_uuid BINARY(16)
)
BEGIN
  -- verify if invoice item stage already exists within this connection, if the
  -- stage already exists simply write to it, otherwise create it select into it
  DECLARE `no_invoice_item_stage` TINYINT(1) DEFAULT 0;
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S02' SET `no_invoice_item_stage` = 1;
  SELECT NULL FROM `stage_invoice_item` LIMIT 0;

  IF (`no_invoice_item_stage` = 1) THEN
    -- tables does not exist - create and enter data
    create temporary table stage_invoice_item
      (select uuid, inventory_uuid, quantity, transaction_price, inventory_price, debit, credit, invoice_uuid);
  ELSE
    -- table exists - only enter data
    insert into stage_invoice_item
      (select uuid, inventory_uuid, quantity, transaction_price, inventory_price, debit, credit, invoice_uuid);
  END IF;
END $$


CREATE PROCEDURE StageBillingService(
  IN id SMALLINT UNSIGNED,
  IN invoice_uuid BINARY(16)
)
BEGIN
  CALL VerifyBillingServiceStageTable();

   insert into stage_billing_service
  (select id, invoice_uuid);
END $$

CREATE PROCEDURE StageSubsidy(
  IN id SMALLINT UNSIGNED,
  IN invoice_uuid BINARY(16)
)
BEGIN
  CALL VerifySubsidyStageTable();

  insert into stage_subsidy
  (select id, invoice_uuid);
END $$

-- create a temporary staging table for the subsidies, this is done via a helper
-- method to ensure it has been created as sale writing time (subsidies are an
-- optional entity that may or may not have been called for staging)
CREATE PROCEDURE VerifySubsidyStageTable()
BEGIN
  create table if not exists stage_subsidy (id INTEGER, invoice_uuid BINARY(16));
END $$

CREATE PROCEDURE VerifyBillingServiceStageTable()
BEGIN
  create table if not exists stage_billing_service (id INTEGER, invoice_uuid BINARY(16));
END $$

CREATE PROCEDURE WriteInvoice(
  IN uuid BINARY(16)
)
BEGIN
  -- running calculation variables
  DECLARE items_cost decimal(19, 4);
  DECLARE billing_services_cost decimal(19, 4);
  DECLARE total_cost_to_debtor decimal(19, 4);
  DECLARE total_subsidy_cost decimal(19, 4);
  DECLARE total_subsidised_cost decimal(19, 4);

  -- ensure that all optional entities have staging tables available, it is
  -- possible that the invoice has not invoked methods to stage subsidies and
  -- billing services if they are not relevant - this makes sure the tables exist
  -- for queries within this method
  CALL VerifySubsidyStageTable();
  CALL VerifyBillingServiceStageTable();

  -- invoice details
  INSERT INTO invoice (project_id, uuid, cost, debtor_uuid, service_id, user_id, date, description, is_distributable)
  SELECT * from stage_invoice where stage_invoice.uuid = uuid;

  -- invoice item details
  INSERT INTO invoice_item (uuid, inventory_uuid, quantity, transaction_price, inventory_price, debit, credit, invoice_uuid)
  SELECT * from stage_invoice_item WHERE stage_invoice_item.invoice_uuid = uuid;

  -- Total cost of all invoice items
  SET items_cost = (SELECT SUM(credit) as cost FROM invoice_item where invoice_uuid = uuid);

  -- calculate billing services based on total item cost
  INSERT INTO invoice_billing_service (invoice_uuid, value, billing_service_id)
  SELECT uuid, (billing_service.value / 100) * items_cost, billing_service.id
  FROM billing_service WHERE id in (SELECT id FROM stage_billing_service where invoice_uuid = uuid);

  -- total cost of all invoice items and billing services
  SET billing_services_cost = (SELECT IFNULL(SUM(value), 0) AS value from invoice_billing_service WHERE invoice_uuid = uuid);
  SET total_cost_to_debtor = items_cost + billing_services_cost;

  -- calculate subsidy cost based on total cost to debtor
  INSERT INTO invoice_subsidy (invoice_uuid, value, subsidy_id)
  SELECT uuid, (subsidy.value / 100) * total_cost_to_debtor, subsidy.id
  FROM subsidy WHERE id in (SELECT id FROM stage_subsidy where invoice_uuid = uuid);

  -- calculate final value debtor must pay based on subsidised costs
  SET total_subsidy_cost = (SELECT IFNULL(SUM(value), 0) AS value from invoice_subsidy WHERE invoice_uuid = uuid);
  SET total_subsidised_cost = total_cost_to_debtor - total_subsidy_cost;

  -- update relevant fields to represent final costs
  UPDATE invoice SET cost = total_subsidised_cost
  WHERE invoice.uuid = uuid;

  -- return information relevant to the final calculated and written bill
  select items_cost, billing_services_cost, total_cost_to_debtor, total_subsidy_cost, total_subsidised_cost;
END $$

CREATE PROCEDURE PostInvoice(
  IN uuid binary(16)
)
BEGIN
  -- required posting values
  DECLARE date DATETIME;
  DECLARE enterprise_id SMALLINT(5);
  DECLARE project_id SMALLINT(5);
  DECLARE currency_id TINYINT(3) UNSIGNED;

  -- variables to store core set-up results
  DECLARE current_fiscal_year_id MEDIUMINT(8) UNSIGNED;
  DECLARE current_period_id MEDIUMINT(8) UNSIGNED;
  DECLARE current_exchange_rate DECIMAL(19, 4) UNSIGNED;
  DECLARE enterprise_currency_id TINYINT(3) UNSIGNED;
  DECLARE transaction_id VARCHAR(100);
  DECLARE gain_account_id INT UNSIGNED;
  DECLARE loss_account_id INT UNSIGNED;

  -- populate initial values specifically for this invoice
  SELECT invoice.date, enterprise.id, project.id, enterprise.currency_id
    INTO date, enterprise_id, project_id, currency_id
  FROM invoice join project join enterprise on invoice.project_id = project.id AND project.enterprise_id = enterprise.id
  WHERE invoice.uuid = uuid;

  -- populate core set-up values
  CALL PostingSetupUtil(date, enterprise_id, project_id, currency_id, current_fiscal_year_id, current_period_id, current_exchange_rate, enterprise_currency_id, transaction_id, gain_account_id, loss_account_id);

  CALL CopyInvoiceToPostingJournal(uuid, transaction_id, project_id, current_fiscal_year_id, current_period_id, currency_id);
END $$


CREATE PROCEDURE PostingSetupUtil(
  IN date DATETIME,
  IN enterprise_id SMALLINT(5),
  IN project_id SMALLINT(5),
  IN currency_id TINYINT(3) UNSIGNED,
  OUT current_fiscal_year_id MEDIUMINT(8) UNSIGNED,
  OUT current_period_id MEDIUMINT(8) UNSIGNED,
  OUT current_exchange_rate DECIMAL(19, 4) UNSIGNED,
  OUT enterprise_currency_id TINYINT(3) UNSIGNED,
  OUT transaction_id VARCHAR(100),
  OUT gain_account INT UNSIGNED,
  OUT loss_account INT UNSIGNED
)
BEGIN
  SET current_fiscal_year_id = (
    SELECT id FROM fiscal_year AS fy
    WHERE date BETWEEN fy.start_date AND DATE(ADDDATE(fy.start_date, INTERVAL fy.number_of_months MONTH)) AND fy.enterprise_id = enterprise_id
  );

  SET current_period_id = (
    SELECT id FROM period AS p
    WHERE DATE(date) BETWEEN DATE(p.start_date) AND DATE(p.end_date) AND p.fiscal_year_id = current_fiscal_year_id
  );

  SELECT e.gain_account_id, e.loss_account_id, e.currency_id
    INTO gain_account, loss_account, enterprise_currency_id
  FROM enterprise AS e WHERE e.id = enterprise_id;

  -- this uses the currency id passed in as a dependency
  SET current_exchange_rate = GetExchangeRate(enterprise_id, currency_id, date);
  SET current_exchange_rate = (SELECT IF(currency_id = enterprise_currency_id, 1, current_exchange_rate));

  SET transaction_id = GenerateTransactionId(project_id);

  -- error handling
  CALL PostingJournalErrorHandler(enterprise_id, project_id, current_fiscal_year_id, current_period_id, current_exchange_rate, date);
END $$

-- detects MySQL Posting Journal Errors
CREATE PROCEDURE PostingJournalErrorHandler(
  enterprise INT,
  project INT,
  fiscal INT,
  period INT,
  exchange DECIMAL,
  date DATETIME
)
BEGIN

  -- set up error declarations
  DECLARE NoEnterprise CONDITION FOR SQLSTATE '45001';
  DECLARE NoProject CONDITION FOR SQLSTATE '45002';
  DECLARE NoFiscalYear CONDITION FOR SQLSTATE '45003';
  DECLARE NoPeriod CONDITION FOR SQLSTATE '45004';
  DECLARE NoExchangeRate CONDITION FOR SQLSTATE '45005';

  IF enterprise IS NULL THEN
    SIGNAL NoEnterprise
      SET MESSAGE_TEXT = 'No enterprise found in the database.';
  END IF;

  IF project IS NULL THEN
    SIGNAL NoProject
      SET MESSAGE_TEXT = 'No project provided for that record.';
  END IF;

  IF fiscal IS NULL THEN
    SET @text = CONCAT('No fiscal year found for the provided date: ', CAST(date AS char));
    SIGNAL NoFiscalYear
      SET MESSAGE_TEXT = @text;
  END IF;

  IF period IS NULL THEN
    SET @text = CONCAT('No period found for the provided date: ', CAST(date AS char));
    SIGNAL NoPeriod
      SET MESSAGE_TEXT = @text;
  END IF;

  IF exchange IS NULL THEN
    SET @text = CONCAT('No exchange rate found for the provided date: ', CAST(date AS char));
    SIGNAL NoExchangeRate
      SET MESSAGE_TEXT = @text;
  END IF;
END
$$

-- Credit For Cautions
CREATE PROCEDURE CopyInvoiceToPostingJournal(
  iuuid BINARY(16),  -- the UUID of the patient invoice
  transId TEXT,
  projectId INT,
  fiscalYearId INT,
  periodId INT,
  currencyId INT
)
BEGIN
  -- local variables
  DECLARE done INT DEFAULT FALSE;

  -- invoice variables
  DECLARE idate DATETIME;
  DECLARE icost DECIMAL(19,4);
  DECLARE ientityId BINARY(16);
  DECLARE iuserId INT;
  DECLARE idescription TEXT;
  DECLARE iaccountId INT;

  -- caution variables
  DECLARE cid BINARY(16);
  DECLARE cbalance DECIMAL(19,4);
  DECLARE cdate DATETIME;
  DECLARE cdescription TEXT;

 -- cursor for debtor's cautions
  DECLARE curse CURSOR FOR
    SELECT c.id, c.date, c.description, SUM(c.credit - c.debit) AS balance FROM (
        SELECT debit, credit, combined_ledger.date, combined_ledger.description, record_uuid AS id
        FROM combined_ledger JOIN cash
          ON cash.uuid = combined_ledger.record_uuid
        WHERE reference_uuid IS NULL AND entity_uuid = ientityId AND cash.is_caution = 0
      UNION
        SELECT debit, credit, combined_ledger.date, combined_ledger.description, reference_uuid AS id
        FROM combined_ledger JOIN cash
          ON cash.uuid = combined_ledger.reference_uuid
        WHERE entity_uuid = ientityId AND cash.is_caution = 0
    ) AS c
    GROUP BY c.id
    HAVING balance > 0
    ORDER BY c.date;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  -- set the invoice variables
  SELECT cost, debtor_uuid, date, user_id, description
    INTO icost, ientityId, idate, iuserId, idescription
  FROM invoice WHERE invoice.uuid = iuuid;

  -- set the transaction variables (account)
  SELECT account_id INTO iaccountId
  FROM debtor JOIN debtor_group
   ON debtor.group_uuid = debtor_group.uuid
  WHERE debtor.uuid = ientityId;

  -- open the cursor
  OPEN curse;

  -- create a prepared statement for efficiently writing to the posting_journal
  -- from within the caution LOOP

  -- loop through the cursor of caution payments and allocate payments against
  -- the current invoice to the caution by setting reference_uuid to the
  -- caution's record_uuid.
  cautionLoop: LOOP
    FETCH curse INTO cid, cdate, cdescription, cbalance;

    IF done THEN
      LEAVE cautionLoop;
    END IF;

    -- check: if the caution is more than the cost, assign the total cost of the
    -- invoice to the caution and exit the loop.
    IF cbalance >= scost THEN

      -- write the cost value from into the posting journal
      INSERT INTO posting_journal
          (uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
          record_uuid, description, account_id, debit, credit, debit_equiv,
          credit_equiv, currency_id, entity_uuid, entity_type, reference_uuid,
          user_id, origin_id)
        VALUES (
          HUID(UUID()), projectId, fiscalYearId, periodId, transId, idate, iuuid, cdescription,
          iaccountId, icost, 0, icost, 0, currencyId, ientityId, 'D', cid, iuserId, 1
        );

      -- exit the loop
      SET done = TRUE;

    -- else: the caution is less than the cost, assign the total caution cost to
    -- the caution (making it 0), and continue
    ELSE

      -- if there is no more caution balance escape
      IF cbalance = 0 THEN
        SET done = TRUE;
      ELSE
        -- subtract the caution's balance from the cost
        SET icost = icost - cbalance;

        INSERT INTO posting_journal (
          uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
          record_uuid, description, account_id, debit, credit, debit_equiv,
          credit_equiv, currency_id, entity_uuid, entity_type, reference_uuid,
          user_id, origin_id
        ) VALUES (
          HUID(UUID()), projectId, fiscalYearId, periodId, transId, idate,
          iuuid, cdescription, iaccountId, cbalance, 0, cbalance, 0,
          currencyId, ientityId, 'D', cid, iuserId, 1
        );

      END IF;
    END IF;
  END LOOP;

  -- close the cursor
  CLOSE curse;

  -- if there is remainder cost, bill the debtor the full amount
  IF icost > 0 THEN
    INSERT INTO posting_journal (
      uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
      record_uuid, description, account_id, debit, credit, debit_equiv,
      credit_equiv, currency_id, entity_uuid, entity_type, user_id, origin_id
    ) VALUES (
      HUID(UUID()), projectId, fiscalYearId, periodId, transId, idate,
      iuuid, idescription, iaccountId, icost, 0, icost, 0,
      currencyId, ientityId, 'D', iuserId, 1
    );
  END IF;

  -- copy the invoice_items into the posting_journal
  INSERT INTO posting_journal (
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, origin_id, user_id
  ) SELECT
    HUID(UUID()), i.project_id, fiscalYearId, periodId, transId, i.date, i.uuid,
    i.description, ig.sales_account, ii.debit, ii.credit, ii.debit, ii.credit,
    currencyId, 1, i.user_id
  FROM invoice AS i JOIN invoice_item AS ii JOIN inventory as inv JOIN inventory_group AS ig ON
    i.uuid = ii.invoice_uuid AND
    ii.inventory_uuid = inv.uuid AND
    inv.group_uuid = ig.uuid
  WHERE i.uuid = iuuid;

  -- copy the invoice_subsidy records into the posting_journal (debits)
  INSERT INTO posting_journal (
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, origin_id, user_id
  ) SELECT
    HUID(UUID()), i.project_id, fiscalYearId, periodId, transId, i.date, i.uuid,
    su.description, su.account_id, isu.value, 0, isu.value, 0, currencyId, 1,
    i.user_id
  FROM invoice AS i JOIN invoice_subsidy AS isu JOIN subsidy AS su ON
    i.uuid = isu.invoice_uuid AND
    isu.subsidy_id = su.id
  WHERE i.uuid = iuuid;

  -- copy the invoice_billing_service records into the posting_journal (credits)
  INSERT INTO posting_journal (
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, origin_id, user_id
  ) SELECT
    HUID(UUID()), i.project_id, fiscalYearId, periodId, transId, i.date, i.uuid,
    b.description, b.account_id, 0, ib.value, 0, ib.value, currencyId, 1,
    i.user_id
  FROM invoice AS i JOIN invoice_billing_service AS ib JOIN billing_service AS b ON
    i.uuid = ib.invoice_uuid AND
    ib.billing_service_id = b.id
  WHERE i.uuid = iuuid;
END
$$

CREATE PROCEDURE postToGeneralLedger ( IN transactions TEXT )
    BEGIN
     SET @sql = concat(
     "INSERT INTO general_ledger
     (project_id, uuid, fiscal_year_id, period_id, trans_id, trans_date, record_uuid,
      description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id,
       entity_uuid, entity_type, reference_uuid, comment, origin_id, user_id, cc_id, pc_id)
     SELECT project_id, uuid, fiscal_year_id, period_id, trans_id, trans_date, record_uuid,
         description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id,
          entity_uuid, entity_type, reference_uuid, comment, origin_id, user_id, cc_id, pc_id
     FROM posting_journal
     WHERE trans_id
     IN (", transactions, ")");

     PREPARE stmt FROM @sql;
     EXECUTE stmt;
    END
$$

CREATE PROCEDURE writePeriodTotals ( IN transactions TEXT )
    BEGIN
     SET @sql = concat(
     "INSERT INTO period_total
     (account_id, credit, debit, fiscal_year_id, enterprise_id, period_id)
     SELECT account_id, SUM(credit_equiv) AS credit, SUM(debit_equiv) as debit , fiscal_year_id, project.enterprise_id,
     period_id FROM posting_journal JOIN project ON posting_journal.project_id = project.id
     WHERE trans_id
     IN (", transactions, ")
     GROUP BY period_id, account_id
     ON DUPLICATE KEY UPDATE credit = credit + VALUES(credit), debit = debit + VALUES(debit)");

     PREPARE stmt FROM @sql;
     EXECUTE stmt;
    END
$$

CREATE PROCEDURE removePostedTransactions ( IN transactions TEXT )
    BEGIN
     SET @sql = concat( "DELETE FROM posting_journal WHERE trans_id IN (", transactions, ")");

     PREPARE stmt FROM @sql;
     EXECUTE stmt;
    END
$$

-- Handles the Cash Table's Rounding
-- CREATE PROCEDURE HandleCashRounding(
--   uuid BINARY(16),
--   enterpriseCurrencyId INT,
--   exchange DECIMAL
-- )
-- BEGIN
--
-- Post Cash Payments
CREATE PROCEDURE PostCash(
  IN cashUuid binary(16)
)
BEGIN
  -- required posting values
  DECLARE cashDate DATETIME;
  DECLARE cashEnterpriseId SMALLINT(5);
  DECLARE cashCurrencyId TINYINT(3) UNSIGNED;
  DECLARE cashAmount DECIMAL(19,4);
  DECLARE enterpriseCurrencyId INT;
  DECLARE isCaution BOOLEAN;

  -- variables to store core set-up results
  DECLARE cashProjectId SMALLINT(5);
  DECLARE currentFiscalYearId MEDIUMINT(8) UNSIGNED;
  DECLARE currentPeriodId MEDIUMINT(8) UNSIGNED;
  DECLARE currentExchangeRate DECIMAL(19, 8);
  DECLARE transactionId VARCHAR(100);
  DECLARE gain_account_id INT UNSIGNED;
  DECLARE loss_account_id INT UNSIGNED;

  DECLARE minMonentaryUnit DECIMAL(19,4);
  DECLARE previousInvoiceBalances DECIMAL(19,4);

  DECLARE remainder DECIMAL(19,4);
  DECLARE lastInvoiceUuid BINARY(16);

  -- copy cash payment values into working variables
  SELECT cash.amount, cash.date, cash.currency_id, enterprise.id, cash.project_id, enterprise.currency_id, cash.is_caution
    INTO  cashAmount, cashDate, cashCurrencyId, cashEnterpriseId, cashProjectId, enterpriseCurrencyId, isCaution
  FROM cash
    JOIN project ON cash.project_id = project.id
    JOIN enterprise ON project.enterprise_id = enterprise.id
  WHERE cash.uuid = cashUuid;

  -- populate core setup values
  CALL PostingSetupUtil(cashDate, cashEnterpriseId, cashProjectId, cashCurrencyId, currentFiscalYearId, currentPeriodId, currentExchangeRate, enterpriseCurrencyId, transactionId, gain_account_id, loss_account_id);

  -- get the current exchange rate
  SET currentExchangeRate = GetExchangeRate(cashEnterpriseId, cashCurrencyId, cashDate);
  SET currentExchangeRate = (SELECT IF(cashCurrencyId = enterpriseCurrencyId, 1, currentExchangeRate));

  /*
    Begin the posting process.  We will first write the total value as moving into the cashbox
    (a debit to the cashbox's cash account).  Then, we will loop through each cash_item and credit
    the debtor for the amount they paid towards each invoice.

    NOTE
    In this section we divide by exchange rate (like x * (1/exchangeRate)) because we are converting
    from a non-native currency into the native enterprise currency.
  */

  -- write the cash amount going into the cashbox to the posting_journal
  INSERT INTO posting_journal (
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, user_id
  ) SELECT
    HUID(UUID()), cashProjectId, currentFiscalYearId, currentPeriodId, transactionId, c.date, c.uuid, c.description,
    cb.account_id, c.amount, 0, (c.amount / currentExchangeRate), 0, c.currency_id, c.user_id
  FROM cash AS c
    JOIN cash_box_account_currency AS cb ON cb.currency_id = c.currency_id AND cb.cash_box_id = c.cashbox_id
  WHERE c.uuid = cashUuid;

  /*
    If this is a caution payment, all we need to do is convert and write a single
    line to the posting_journal.
  */
  IF isCaution THEN

    INSERT INTO posting_journal (
      uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
      record_uuid, description, account_id, debit, credit, debit_equiv,
      credit_equiv, currency_id, entity_uuid, entity_type, user_id
    ) SELECT
      HUID(UUID()), cashProjectId, currentFiscalYearId, currentPeriodId, transactionId, c.date, c.uuid,
      c.description, dg.account_id, 0, c.amount, 0, (c.amount / currentExchangeRate), c.currency_id,
      c.debtor_uuid, 'D', c.user_id
    FROM cash AS c
      JOIN debtor AS d ON c.debtor_uuid = d.uuid
      JOIN debtor_group AS dg ON d.group_uuid = dg.uuid
    WHERE c.uuid = cashUuid;

  /*
    In this block, we are paying cash items.  We have to look through each cash item, recording the
    amount paid as a new line in the posting_journal.  The `reference_uuid` is assigned to the
    `invoice_uuid` of the cash_item table.
  */
  ELSE

    -- write each cash_item into the posting_journal
    INSERT INTO posting_journal (
      uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
      record_uuid, description, account_id, debit, credit, debit_equiv,
      credit_equiv, currency_id, entity_uuid, entity_type, user_id, reference_uuid
    ) SELECT
      HUID(UUID()), cashProjectId, currentFiscalYearId, currentPeriodId, transactionId, c.date, c.uuid,
      c.description, dg.account_id, 0, ci.amount, 0, (ci.amount / currentExchangeRate), c.currency_id,
      c.debtor_uuid, 'D', c.user_id, ci.invoice_uuid
    FROM cash AS c
      JOIN cash_item AS ci ON c.uuid = ci.cash_uuid
      JOIN debtor AS d ON c.debtor_uuid = d.uuid
      JOIN debtor_group AS dg ON d.group_uuid = dg.uuid
    WHERE c.uuid = cashUuid;

    /*
      Finally, we have to see if there is any rounding to do.  If the absolute value of the balance
      due minus the balance paid is less than the minMonentaryUnit, it means we should just round that
      amount away.

      If (cashAmount - previousInvoiceBalances) > 0 then the debtor overpaid and we should debit them and
      credit the rounding account.  If the (cashAmount - previousInvoiceBalances) is negative, then the debtor
      underpaid and we should credit them and debit the rounding account the remainder
    */

    /* These values are in the original currency amount */
    SET previousInvoiceBalances = (
      SELECT SUM(invoice.balance) AS balance FROM stage_cash_invoice_balances AS invoice
    );

    -- this is date ASC to get the most recent invoice
    SET lastInvoiceUuid = (
      SELECT invoice.uuid FROM stage_cash_invoice_balances AS invoice ORDER BY invoice.date LIMIT 1
    );

    SET minMonentaryUnit = (
      SELECT currency.min_monentary_unit FROM currency WHERE currency.id = cashCurrencyId
    );

    SET remainder = cashAmount - previousInvoiceBalances;

    -- check if we should round or not
    -- if the remainder is 0 the invoice is payed without need for rounding
    IF (minMonentaryUnit > ABS(remainder) && remainder <> 0) THEN

      /*
        A positive remainder means that the debtor overpaid slightly and we should debit
        the difference to the debtor and credit the difference as a gain to the gain_account

        - The debtor entity an invoice reference are not included on the gain
          account transaction. In this case the debtor covered MORE than the 
          invoiced amount and so referencing them on the enterprise gain will 
          actually debit them the additional amount. 
      */
      IF (remainder > 0) THEN
  
        -- The debtor is not debited in this transaction. They have already 
        -- balanced the invoice and their debt according to the invoice (the 
        -- exact amount). The additional payment can just be put in a gain account.
        
        -- credit the rounding account
        INSERT INTO posting_journal (
          uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
          record_uuid, description, account_id, debit, credit, debit_equiv,
          credit_equiv, currency_id, user_id
        ) SELECT
          HUID(UUID()), cashProjectId, currentFiscalYearId, currentPeriodId, transactionId, c.date, c.uuid, c.description,
          gain_account_id, 0, remainder, 0, (remainder / currentExchangeRate), c.currency_id, c.user_id
        FROM cash AS c
          JOIN debtor AS d ON c.debtor_uuid = d.uuid
          JOIN debtor_group AS dg ON d.group_uuid = dg.uuid
        WHERE c.uuid = cashUuid;

      /*
        A negative remainder means that the debtor underpaid slightly and we should credit
        the difference to the debtor and debit the difference as a loss to the loss_account

        - The debtor and invoice are referenced on the loss account transaction 
          make up for the amount that is loss. In this case the debtor has not 
          actually paid enough money to cover the amount of the invoice. If this 
          is not referenced his balance will not be zero.
      */
      ELSE

        -- convert the remainder into the enterprise currency
        SET remainder = (-1 * remainder);

        -- credit the debtor
        INSERT INTO posting_journal (
          uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
          record_uuid, description, account_id, debit, credit, debit_equiv,
          credit_equiv, currency_id, entity_uuid, entity_type, user_id, reference_uuid
        ) SELECT
          HUID(UUID()), cashProjectId, currentFiscalYearId, currentPeriodId, transactionId, c.date, c.uuid, c.description,
          dg.account_id, 0, remainder, 0, (remainder / currentExchangeRate), c.currency_id,
          c.debtor_uuid, 'D', c.user_id, lastInvoiceUuid
        FROM cash AS c
          JOIN debtor AS d ON c.debtor_uuid = d.uuid
          JOIN debtor_group AS dg ON d.group_uuid = dg.uuid
        WHERE c.uuid = cashUuid;

        -- debit the rounding account
        INSERT INTO posting_journal (
          uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
          record_uuid, description, account_id, debit, credit, debit_equiv,
          credit_equiv, currency_id, user_id
        ) SELECT
          HUID(UUID()), cashProjectId, currentFiscalYearId, currentPeriodId, transactionId, c.date, c.uuid, c.description,
          loss_account_id, remainder, 0, (remainder / currentExchangeRate), 0, c.currency_id, c.user_id
        FROM cash AS c
          JOIN debtor AS d ON c.debtor_uuid = d.uuid
          JOIN debtor_group AS dg ON d.group_uuid = dg.uuid
        WHERE c.uuid = cashUuid;
      END IF;
    END IF;
  END IF;
END $$

CREATE PROCEDURE StageCash(
  IN amount DECIMAL(19,4) UNSIGNED,
  IN currency_id TINYINT(3),
  IN cashbox_id MEDIUMINT(8) UNSIGNED,
  IN debtor_uuid BINARY(16),
  IN project_id SMALLINT(5) UNSIGNED,
  IN date TIMESTAMP,
  IN user_id SMALLINT(5) UNSIGNED,
  IN is_caution BOOLEAN,
  IN description TEXT,
  IN uuid BINARY(16)
)
BEGIN
  -- verify if cash stage already exists within this connection, if the
  -- stage already exists simply write to it, otherwise create it select into it
  DECLARE `no_cash_stage` TINYINT(1) DEFAULT 0;
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S02' SET `no_cash_stage` = 1;
  SELECT NULL FROM stage_cash LIMIT 0;


  IF (`no_cash_stage` = 1) THEN
    CREATE TEMPORARY TABLE stage_cash
      (SELECT uuid, project_id, date, debtor_uuid, currency_id, amount, user_id, cashbox_id, description, is_caution);

  ELSE
    INSERT INTO stage_cash
      (SELECT uuid, project_id, date, debtor_uuid, currency_id, amount, user_id, cashbox_id, description, is_caution);
  END IF;
END $$

CREATE PROCEDURE StageCashItem(
  IN uuid BINARY(16),
  IN cash_uuid BINARY(16),
  IN invoice_uuid BINARY(16)
)
BEGIN
  -- verify if cash_item stage already exists within this connection, if the
  -- stage already exists simply write to it, otherwise create it select into it
  DECLARE `no_cash_item_stage` TINYINT(1) DEFAULT 0;
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S02' SET `no_cash_item_stage` = 1;
  SELECT NULL FROM `stage_cash_item` LIMIT 0;

  IF (`no_cash_item_stage` = 1) THEN
    CREATE TEMPORARY TABLE stage_cash_item
      (SELECT uuid, cash_uuid, invoice_uuid);

  ELSE
    INSERT INTO stage_cash_item
      (SELECT uuid, cash_uuid, invoice_uuid);
  END IF;
END $$

-- This calculates the amount due on previous invoices based on what is being paid
CREATE PROCEDURE CalculateCashInvoiceBalances(
  IN cashUuid BINARY(16)
)
BEGIN
  DECLARE cashDate DATETIME;
  DECLARE cashCurrencyId INT;
  DECLARE cashEnterpriseId INT;
  DECLARE cashDebtorUuid BINARY(16);
  DECLARE enterpriseCurrencyId INT;
  DECLARE currentExchangeRate DECIMAL(19,4);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
  DECLARE EXIT HANDLER FOR SQLWARNING ROLLBACK;

  -- copy cash payment values into working variables
  SELECT cash.date, cash.currency_id, enterprise.id, enterprise.currency_id, cash.debtor_uuid
    INTO cashDate, cashCurrencyId, cashEnterpriseId, enterpriseCurrencyId, cashDebtorUuid
  FROM stage_cash AS cash
    JOIN project ON cash.project_id = project.id
    JOIN enterprise ON project.enterprise_id = enterprise.id
  WHERE cash.uuid = cashUuid;

  /* calculate the exchange rate for balances based on the stored cash currency */
  SET currentExchangeRate = GetExchangeRate(cashEnterpriseId, cashCurrencyId, cashDate);
  SET currentExchangeRate = (SELECT IF(cashCurrencyId = enterpriseCurrencyId, 1, currentExchangeRate));

  CREATE TEMPORARY TABLE IF NOT EXISTS stage_cash_records (
    uuid BINARY(16), debit DECIMAL(19,4), credit DECIMAL(19,4), entity_uuid BINARY(16), date TIMESTAMP
  );

  CREATE TEMPORARY TABLE IF NOT EXISTS stage_cash_references (
    uuid BINARY(16), debit DECIMAL(19,4), credit DECIMAL(19,4), entity_uuid BINARY(16), date TIMESTAMP
  );

  CREATE TEMPORARY TABLE IF NOT EXISTS stage_cash_invoice_balances (
    uuid BINARY(16), balance DECIMAL(19, 4), date TIMESTAMP
  );

  INSERT INTO stage_cash_records
    SELECT cl.record_uuid AS uuid, cl.debit, cl.credit, cl.entity_uuid, cl.date
    FROM combined_ledger AS cl
    WHERE cl.record_uuid IN (
      SELECT ci.invoice_uuid FROM stage_cash_item AS ci WHERE ci.cash_uuid = cashUuid
    ) AND cl.entity_uuid = cashDebtorUuid;

  INSERT INTO stage_cash_references
    SELECT cl.reference_uuid AS uuid, cl.debit, cl.credit, cl.entity_uuid, cl.date
    FROM combined_ledger AS cl
    WHERE cl.reference_uuid IN (
      SELECT ci.invoice_uuid FROM stage_cash_item AS ci WHERE ci.cash_uuid = cashUuid
    ) AND cl.entity_uuid = cashDebtorUuid;

  INSERT INTO stage_cash_invoice_balances
    SELECT zz.uuid, zz.balance, zz.date
    FROM (
      SELECT ledger.uuid, (SUM(ledger.debit - ledger.credit) * currentExchangeRate) AS balance, MIN(ledger.date) AS date
      FROM (
        SELECT crec.uuid, crec.debit, crec.credit, crec.entity_uuid, crec.date FROM stage_cash_records AS crec
      UNION ALL
        SELECT cref.uuid, cref.debit, cref.credit, cref.entity_uuid, cref.date FROM stage_cash_references AS cref
      ) AS ledger
      GROUP BY ledger.uuid
    ) AS zz ORDER BY zz.date;
END $$

/*
  WriteCashItems

  Allocates cash payment to invoices, making sure that the debtor does not
  overpay the invoice amounts.
*/
CREATE PROCEDURE WriteCashItems(
  IN cashUuid BINARY(16)
)
BEGIN

  DECLARE cashAmount DECIMAL(19, 4);
  DECLARE minMonentaryUnit DECIMAL(19,4);

  DECLARE totalInvoiceCost DECIMAL(19,4);
  DECLARE amountToAllocate DECIMAL(19,4);
  DECLARE allocationAmount DECIMAL(19,4);
  DECLARE invoiceUuid BINARY(16);
  DECLARE invoiceBalance DECIMAL(19,4);
  DECLARE done INT DEFAULT FALSE;

  -- error condition states
  DECLARE Overpaid CONDITION FOR SQLSTATE '45501';

  -- CURSOR for allocation of payments to invoice costs.
  DECLARE curse CURSOR FOR SELECT invoice.uuid, invoice.balance FROM stage_cash_invoice_balances AS invoice;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  -- set local variables
  SELECT cash.amount, currency.min_monentary_unit
    INTO cashAmount, minMonentaryUnit
  FROM cash JOIN currency ON currency.id = cash.currency_id
  WHERE cash.uuid = cashUuid;

  /*
    Calculate the balances on invoices to pay.
    NOTE: this assumes that CalculateCashInvoiceBalances(cashUuid) has been called before this procedure
  */
  SET totalInvoiceCost = (SELECT IFNULL(SUM(invoice.balance), 0) FROM stage_cash_invoice_balances AS invoice);

  /*
    If the difference between the paid amount and the totalInvoiceCost is greater than the
    minMonentaryUnit, the client has overpaid.
  */
  IF ((cashAmount - totalInvoiceCost)  > minMonentaryUnit) THEN
    SET @text = CONCAT(
      'The invoices appear to be overpaid.  The total cost of all invoices are ',
      CAST(totalInvoiceCost AS char), ' but the cash payment amount is ', CAST(cashAmount AS char)
    );

    SIGNAL Overpaid SET MESSAGE_TEXT = @text;
  END IF;

  /*
   NOTE
   It is possible to underpay.  This is never checked - the loop will
   simply exit early and the other invoices will not be credited.

   Loop through the table of invoice balances, allocating money from the total payment to
   balance those invoices.
  */
  SET amountToAllocate = cashAmount;

  OPEN curse;

  allocateCashPayments: LOOP
    FETCH curse INTO invoiceUuid, invoiceBalance;

    IF done THEN
      LEAVE allocateCashPayments;
    END IF;

    -- figure out how much to allocate
    IF (amountToAllocate - invoiceBalance > 0) THEN
      SET amountToAllocate = amountToAllocate - invoiceBalance;
      SET allocationAmount = invoiceBalance;
    ELSE
      SET allocationAmount = amountToAllocate;
      SET amountToAllocate = 0;
      SET done = TRUE;
    END IF;

    INSERT INTO cash_item
      SELECT stage_cash_item.uuid, stage_cash_item.cash_uuid, allocationAmount, invoiceUuid
      FROM stage_cash_item
      WHERE stage_cash_item.invoice_uuid = invoiceUuid AND stage_cash_item.cash_uuid = cashUuid LIMIT 1;

  END LOOP allocateCashPayments;
END $$

CREATE PROCEDURE WriteCash(
  IN cashUuid BINARY(16)
)
BEGIN

  -- cash details
  INSERT INTO cash (uuid, project_id, date, debtor_uuid, currency_id, amount, user_id, cashbox_id, description, is_caution)
    SELECT * FROM stage_cash WHERE stage_cash.uuid = cashUuid;
END $$

/*
 Create Fiscal Year and Periods

 This procedure help to create fiscal year and fiscal year's periods
 periods include period `0` and period `13`
*/
DELIMITER $$

CREATE PROCEDURE CreateFiscalYear(
  IN p_enterprise_id SMALLINT(5),
  IN p_previous_fiscal_year_id MEDIUMINT(8),
  IN p_user_id SMALLINT(5),
  IN p_label VARCHAR(50),
  IN p_number_of_months MEDIUMINT(8),
  IN p_start_date DATE,
  IN p_end_date DATE,
  IN p_note TEXT,
  OUT fiscalYearId MEDIUMINT(8)
)
BEGIN

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
      ROLLBACK;
    END;

  START TRANSACTION;

    INSERT INTO fiscal_year (
      `enterprise_id`, `previous_fiscal_year_id`, `user_id`, `label`,
      `number_of_months`, `start_date`, `end_date`, `note`
    ) VALUES (
      p_enterprise_id, p_previous_fiscal_year_id, p_user_id, p_label,
      p_number_of_months, p_start_date, p_end_date, p_note
    );

    SET fiscalYearId = LAST_INSERT_ID();
    CALL CreatePeriods(fiscalYearId);

  COMMIT;

END $$

CREATE PROCEDURE GetPeriodRange(
  IN fiscalYearStartDate DATE,
  IN periodNumberIndex SMALLINT(5),
  OUT periodStartDate DATE,
  OUT periodEndDate DATE
)
BEGIN
  DECLARE `innerDate` DATE;

  SET innerDate = (SELECT DATE_ADD(fiscalYearStartDate, INTERVAL periodNumberIndex-1 MONTH));
  SET periodStartDate = (SELECT CAST(DATE_FORMAT(innerDate ,'%Y-%m-01') as DATE));
  SET periodEndDate = (SELECT LAST_DAY(innerDate));
END $$

CREATE PROCEDURE CreatePeriods(
  IN fiscalYearId MEDIUMINT(8)
)
BEGIN
  DECLARE periodId MEDIUMINT(8);
  DECLARE periodNumber SMALLINT(5);
  DECLARE periodStartDate DATE;
  DECLARE periodEndDate DATE;
  DECLARE periodLocked TINYINT(1);

  DECLARE fyEnterpriseId SMALLINT(5);
  DECLARE fyNumberOfMonths MEDIUMINT(8) DEFAULT 0;
  DECLARE fyLabel VARCHAR(50);
  DECLARE fyStartDate DATE;
  DECLARE fyEndDate DATE;
  DECLARE fyPreviousFYId SMALLINT(5);
  DECLARE fyLocked TINYINT(1);
  DECLARE fyCreatedAt TIMESTAMP;
  DECLARE fyUpdatedAt TIMESTAMP;
  DECLARE fyUserId MEDIUMINT(5);
  DECLARE fyNote TEXT;

  DECLARE v_i INT DEFAULT 0;

  -- get the fiscal year informations
  SELECT
    enterprise_id, number_of_months, label, start_date, end_date,
    previous_fiscal_year_id, locked, created_at, updated_at, user_id, note
    INTO
    fyEnterpriseId, fyNumberOfMonths, fyLabel, fyStartDate, fyEndDate,
    fyPreviousFYId, fyLocked, fyCreatedAt, fyUpdatedAt, fyUserId, fyNote
  FROM fiscal_year WHERE id = fiscalYearId;

  -- insert N+2 period
  WHILE v_i <= fyNumberOfMonths + 1 DO

    IF v_i = 0 OR v_i = fyNumberOfMonths + 1 THEN
      -- Extremum periods 0 and N+1
      -- Insert periods with null dates
      INSERT INTO period(`fiscal_year_id`, `number`, `start_date`, `end_date`, `locked`)
      VALUES (fiscalYearId, v_i, NULL, NULL, 0);
    ELSE
      -- Normal periods
      -- Get period dates range
      CALL GetPeriodRange(fyStartDate, v_i, periodStartDate, periodEndDate);

      -- Inserting periods
      INSERT INTO period(`fiscal_year_id`, `number`, `start_date`, `end_date`, `locked`)
      VALUES (fiscalYearId, v_i, periodStartDate, periodEndDate, 0);
    END IF;

    SET v_i = v_i + 1;
  END WHILE;
END $$

CREATE PROCEDURE PostVoucher(
  IN uuid BINARY(16)
)
BEGIN
  DECLARE enterprise_id INT;
  DECLARE project_id INT;
  DECLARE currency_id INT;
  DECLARE date TIMESTAMP;

  -- variables to store core set-up results
  DECLARE fiscal_year_id MEDIUMINT(8) UNSIGNED;
  DECLARE period_id MEDIUMINT(8) UNSIGNED;
  DECLARE current_exchange_rate DECIMAL(19, 4) UNSIGNED;
  DECLARE enterprise_currency_id TINYINT(3) UNSIGNED;
  DECLARE transaction_id VARCHAR(100);
  DECLARE gain_account_id INT UNSIGNED;
  DECLARE loss_account_id INT UNSIGNED;

  --
  SELECT p.enterprise_id, p.id, v.currency_id, v.date
    INTO enterprise_id, project_id, currency_id, date
  FROM voucher AS v JOIN project AS p ON v.project_id = p.id
  WHERE v.uuid = uuid;

  -- populate core setup values
  CALL PostingSetupUtil(date, enterprise_id, project_id, currency_id, fiscal_year_id, period_id, current_exchange_rate, enterprise_currency_id, transaction_id, gain_account_id, loss_account_id);

  -- make sure the exchange rate is correct
  SET current_exchange_rate = GetExchangeRate(enterprise_id, currency_id, date);
  SET current_exchange_rate = (SELECT IF(currency_id = enterprise_currency_id, 1, current_exchange_rate));

  -- POST to the posting journal
  INSERT INTO posting_journal (uuid, project_id, fiscal_year_id, period_id,
    trans_id, trans_date, record_uuid, description, account_id, debit,
    credit, debit_equiv, credit_equiv, currency_id, entity_uuid,
    entity_type, reference_uuid, comment, origin_id, user_id)
  SELECT
    HUID(UUID()), v.project_id, fiscal_year_id, period_id, transaction_id, v.date,
    v.uuid, v.description, vi.account_id, vi.debit, vi.credit,
    vi.debit * current_exchange_rate, vi.credit * current_exchange_rate, v.currency_id,
    vi.entity_uuid, NULL, vi.document_uuid, NULL, v.type_id, v.user_id
  FROM voucher AS v JOIN voucher_item AS vi ON v.uuid = vi.voucher_uuid
  WHERE v.uuid = uuid;

  -- NOTE: this does not handle any rounding - it simply converts the currency as needed.
END $$


CREATE PROCEDURE ReverseTransaction(
  IN uuid BINARY(16),
  IN user_id INT,
  IN description TEXT,
  IN voucher_uuid BINARY(16)
)
BEGIN
  -- NOTE: someone should check that the record_uuid is not used as a reference_uuid somewhere

  -- the voucher type is credit note (id: 10)
  -- @fixme - why do we have `amount` in the voucher table?
  -- @todo - make only one type of reversal (not cash, credit, or voucher)

  INSERT INTO voucher (uuid, date, project_id, currency_id, amount, description, user_id, type_id, reference_uuid)
    SELECT voucher_uuid, NOW(), zz.project_id, enterprise.currency_id, 0, CONCAT_WS(' ', '[reversal]', description, '\n[original description]', zz.description), user_id, 10, uuid
    FROM (
      SELECT pj.project_id, pj.description FROM posting_journal AS pj WHERE pj.record_uuid = uuid
      UNION
      SELECT gl.project_id, gl.description FROM general_ledger AS gl WHERE gl.record_uuid = uuid
    ) AS zz
      JOIN project ON zz.project_id = project.id
      JOIN enterprise ON project.enterprise_id = enterprise.id
    LIMIT 1;

  -- NOTE: the debits and credits are swapped on purpose here
  INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid, document_uuid, entity_uuid)
    SELECT HUID(UUID()), zz.account_id, zz.credit_equiv, zz.debit_equiv, voucher_uuid, zz.reference_uuid, zz.entity_uuid
    FROM (
      SELECT pj.account_id, pj.credit_equiv, pj.debit_equiv, pj.reference_uuid, pj.entity_uuid
      FROM posting_journal AS pj WHERE pj.record_uuid = uuid
      UNION
      SELECT gl.account_id, gl.credit_equiv, gl.debit_equiv, gl.reference_uuid, gl.entity_uuid
      FROM general_ledger AS gl WHERE gl.record_uuid = uuid
    ) AS zz;

  CALL PostVoucher(voucher_uuid);
END $$

DELIMITER ;
