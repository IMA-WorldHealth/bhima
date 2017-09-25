/*
  This file contains all the stored procedures used in bhima's database.  It
  should be loaded after functions.sql.
*/

DELIMITER $$

CREATE PROCEDURE StageInvoice(
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
    CREATE TEMPORARY TABLE stage_invoice
    (SELECT project_id, uuid, cost, debtor_uuid, service_id, user_id, date, description);
  ELSE
    INSERT INTO stage_invoice
    (SELECT project_id, uuid, cost, debtor_uuid, service_id, user_id, date, description);
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
    CREATE TEMPORARY TABLE stage_invoice_item
      (select uuid, inventory_uuid, quantity, transaction_price, inventory_price, debit, credit, invoice_uuid);
  ELSE
    -- table exists - only enter data
    INSERT INTO stage_invoice_item
      (SELECT uuid, inventory_uuid, quantity, transaction_price, inventory_price, debit, credit, invoice_uuid);
  END IF;
END $$


CREATE PROCEDURE StageBillingService(
  IN id SMALLINT UNSIGNED,
  IN invoice_uuid BINARY(16)
)
BEGIN
  CALL VerifyBillingServiceStageTable();

   INSERT INTO stage_billing_service
  (SELECT id, invoice_uuid);
END $$

CREATE PROCEDURE StageSubsidy(
  IN id SMALLINT UNSIGNED,
  IN invoice_uuid BINARY(16)
)
BEGIN
  CALL VerifySubsidyStageTable();

  INSERT INTO stage_subsidy
  (SELECT id, invoice_uuid);
END $$

-- create a temporary staging table for the subsidies, this is done via a helper
-- method to ensure it has been created as sale writing time (subsidies are an
-- optional entity that may or may not have been called for staging)
CREATE PROCEDURE VerifySubsidyStageTable()
BEGIN
  CREATE TEMPORARY TABLE IF NOT EXISTS stage_subsidy (id INTEGER, invoice_uuid BINARY(16));
END $$

CREATE PROCEDURE VerifyBillingServiceStageTable()
BEGIN
  CREATE TEMPORARY TABLE IF NOT EXISTS stage_billing_service (id INTEGER, invoice_uuid BINARY(16));
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
  INSERT INTO invoice (project_id, uuid, cost, debtor_uuid, service_id, user_id, date, description)
  SELECT * FROM stage_invoice WHERE stage_invoice.uuid = uuid;

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
  SELECT items_cost, billing_services_cost, total_cost_to_debtor, total_subsidy_cost, total_subsidised_cost;
END $$

CREATE PROCEDURE PostInvoice(
  IN uuid binary(16)
)
BEGIN
  DECLARE InvalidSalesAccounts CONDITION FOR SQLSTATE '45006';

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

  DECLARE verify_invalid_accounts SMALLINT(5);

  -- populate initial values specifically for this invoice
  SELECT invoice.date, enterprise.id, project.id, enterprise.currency_id
    INTO date, enterprise_id, project_id, currency_id
  FROM invoice join project join enterprise on invoice.project_id = project.id AND project.enterprise_id = enterprise.id
  WHERE invoice.uuid = uuid;

  -- populate core set-up values
  CALL PostingSetupUtil(date, enterprise_id, project_id, currency_id, current_fiscal_year_id, current_period_id, current_exchange_rate, enterprise_currency_id, transaction_id, gain_account_id, loss_account_id);

  -- Check that all invoice items have sales accounts - if they do not the transaction will be imbalanced
  SELECT COUNT(invoice_item.uuid)
    INTO verify_invalid_accounts
  FROM invoice JOIN invoice_item JOIN inventory JOIN inventory_group
  ON invoice.uuid = invoice_item.invoice_uuid
    AND invoice_item.inventory_uuid = inventory.uuid
    AND inventory.group_uuid = inventory_group.uuid
  WHERE invoice.uuid = uuid
  AND inventory_group.sales_account IS NULL;

  IF verify_invalid_accounts > 0 THEN
    SIGNAL InvalidSalesAccounts
    SET MESSAGE_TEXT = 'A NULL sales account has been found for an inventory item in this invoice.';
  END IF;

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

        -- get the record_uuids in the posting journal
        SELECT debit_equiv as debit, credit_equiv as credit, posting_journal.trans_date as date, posting_journal.description, record_uuid AS id
        FROM posting_journal JOIN cash
          ON cash.uuid = posting_journal.record_uuid
        WHERE reference_uuid IS NULL AND entity_uuid = ientityId AND cash.is_caution = 0

      UNION ALL

        -- get the record_uuids in the general ledger
        SELECT debit_equiv as debit, credit_equiv as credit, general_ledger.trans_date as date, general_ledger.description, record_uuid AS id
        FROM general_ledger JOIN cash
          ON cash.uuid = general_ledger.record_uuid
        WHERE reference_uuid IS NULL AND entity_uuid = ientityId AND cash.is_caution = 0

      UNION ALL

        -- get the reference_uuids in the posting_journal
        SELECT debit_equiv as debit, credit_equiv as credit, posting_journal.trans_date as date, posting_journal.description, reference_uuid AS id
        FROM posting_journal JOIN cash
          ON cash.uuid = posting_journal.reference_uuid
        WHERE entity_uuid = ientityId AND cash.is_caution = 0

      UNION ALL

        -- get the reference_uuids in the general_ledger
        SELECT debit_equiv as debit, credit_equiv as credit, general_ledger.trans_date as date, general_ledger.description, reference_uuid AS id
        FROM general_ledger JOIN cash
          ON cash.uuid = general_ledger.reference_uuid
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
          credit_equiv, currency_id, entity_uuid, reference_uuid,
          user_id, origin_id)
        VALUES (
          HUID(UUID()), projectId, fiscalYearId, periodId, transId, idate, iuuid, cdescription,
          iaccountId, icost, 0, icost, 0, currencyId, ientityId, cid, iuserId, 11
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
          credit_equiv, currency_id, entity_uuid, reference_uuid,
          user_id, origin_id
        ) VALUES (
          HUID(UUID()), projectId, fiscalYearId, periodId, transId, idate,
          iuuid, cdescription, iaccountId, cbalance, 0, cbalance, 0,
          currencyId, ientityId, cid, iuserId, 11
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
      credit_equiv, currency_id, entity_uuid, user_id, origin_id
    ) VALUES (
      HUID(UUID()), projectId, fiscalYearId, periodId, transId, idate,
      iuuid, idescription, iaccountId, icost, 0, icost, 0,
      currencyId, ientityId, iuserId, 11
    );
  END IF;

  -- copy the invoice_items into the posting_journal
  INSERT INTO posting_journal (
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, origin_id, user_id
  )
   SELECT
    HUID(UUID()), i.project_id, fiscalYearId, periodId, transId, i.date, i.uuid,
    CONCAT(dm.text,': ', inv.text) as txt, ig.sales_account, ii.debit, ii.credit, ii.debit, ii.credit,
    currencyId, 11, i.user_id
  FROM invoice AS i JOIN invoice_item AS ii JOIN inventory as inv JOIN inventory_group AS ig JOIN document_map as dm ON
    i.uuid = ii.invoice_uuid AND
    ii.inventory_uuid = inv.uuid AND
    inv.group_uuid = ig.uuid AND
    dm.uuid = i.uuid
  WHERE i.uuid = iuuid;

  -- copy the invoice_subsidy records into the posting_journal (debits)
  INSERT INTO posting_journal (
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, origin_id, user_id
  ) SELECT
    HUID(UUID()), i.project_id, fiscalYearId, periodId, transId, i.date, i.uuid,
    i.description, su.account_id, isu.value, 0, isu.value, 0, currencyId, 11,
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
    i.description, b.account_id, 0, ib.value, 0, ib.value, currencyId, 11,
    i.user_id
  FROM invoice AS i JOIN invoice_billing_service AS ib JOIN billing_service AS b ON
    i.uuid = ib.invoice_uuid AND
    ib.billing_service_id = b.id
  WHERE i.uuid = iuuid;
END
$$

CREATE PROCEDURE PostToGeneralLedger(
  IN transactions TEXT
) BEGIN

  CREATE TEMPORARY TABLE IF NOT EXISTS stage_journal_transaction (record_uuid BINARY(16));

  SET @sql = CONCAT(
   "INSERT INTO stage_journal_transaction SELECT DISTINCT record_uuid FROM posting_journal WHERE trans_id IN (", transactions, ");"
  );

  PREPARE stmt FROM @sql;
  EXECUTE stmt;

  DEALLOCATE PREPARE stmt;

  -- write into the posting journal
  INSERT INTO general_ledger (
    project_id, uuid, fiscal_year_id, period_id, trans_id, trans_date, record_uuid,
    description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id,
    entity_uuid, reference_uuid, comment, origin_id, user_id, cc_id, pc_id
  ) SELECT project_id, uuid, fiscal_year_id, period_id, trans_id, trans_date, record_uuid,
    description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id,
    entity_uuid, reference_uuid, comment, origin_id, user_id, cc_id, pc_id
  FROM posting_journal
  WHERE posting_journal.record_uuid IN (SELECT record_uuid FROM stage_journal_transaction);

  -- write into period_total
  INSERT INTO period_total (
    account_id, credit, debit, fiscal_year_id, enterprise_id, period_id
  )
  SELECT account_id, SUM(credit_equiv) AS credit, SUM(debit_equiv) as debit,
    fiscal_year_id, project.enterprise_id, period_id
  FROM posting_journal JOIN project
    ON posting_journal.project_id = project.id
  WHERE posting_journal.record_uuid IN (SELECT record_uuid FROM stage_journal_transaction)
  GROUP BY period_id, account_id
  ON DUPLICATE KEY UPDATE credit = credit + VALUES(credit), debit = debit + VALUES(debit);

  -- remove from posting journal
  DELETE FROM posting_journal WHERE record_uuid IN (SELECT record_uuid FROM stage_journal_transaction);
END $$

SOURCE procedures/cash.sql

/*
 Create Fiscal Year and Periods

 This procedure help to create fiscal year and fiscal year's periods
 periods include period `0` and period `13`
*/
DELIMITER $$

SOURCE procedures/periods.sql

SOURCE procedures/voucher.sql

SOURCE procedures/location.sql

SOURCE procedures/trial_balance.sql

SOURCE procedures/stock.sql

SOURCE procedures/posting.sql
