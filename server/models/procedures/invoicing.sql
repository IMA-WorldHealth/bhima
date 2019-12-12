DELIMITER $$
/*
  This file contains code for creating and posting invoices made to patients.

  NOTE
  The rationale behind the Stage* procedures is to interface between JS and SQL.  Every stage method sets up a temporary table that can be used by other
  methods.  As temporary tables, they are scoped to the current connection,
  meaning that all other methods _must_ be called in the same database
  transaction.  Once the connection terminates, the tables are cleaned up.
*/


/*
  Prepare the record to be written to the `invoice` table.
*/
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
  -- stage already exists simply write to it, otherwise create and select into it
  DECLARE `no_invoice_stage` TINYINT(1) DEFAULT 0;
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S02' SET `no_invoice_stage` = 1;
  SELECT NULL FROM `stage_invoice` LIMIT 0;

  IF (`no_invoice_stage` = 1) THEN
    CREATE TEMPORARY TABLE stage_invoice (
      SELECT project_id, uuid, cost, debtor_uuid, service_id, user_id, date,
        description
    );
  ELSE
    INSERT INTO stage_invoice (
      SELECT project_id, uuid, cost, debtor_uuid, service_id, user_id, date,
        description
    );
  END IF;
END $$

/*
  Prepare record(s) to be written to the `invoice_item` table.
*/
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

  -- tables does not exist - create and enter data
  IF (`no_invoice_item_stage` = 1) THEN
    CREATE TEMPORARY TABLE stage_invoice_item (
      SELECT uuid, inventory_uuid, quantity, transaction_price, inventory_price,
        debit, credit, invoice_uuid
    );

  -- table exists - only enter data
  ELSE
    INSERT INTO stage_invoice_item (
      SELECT uuid, inventory_uuid, quantity, transaction_price, inventory_price,
        debit, credit, invoice_uuid
    );
  END IF;
END $$


CREATE PROCEDURE StageInvoicingFee(
  IN id SMALLINT UNSIGNED,
  IN invoice_uuid BINARY(16)
)
BEGIN
  CALL VerifyInvoicingFeeStageTable();
  INSERT INTO stage_invoicing_fee (SELECT id, invoice_uuid);
END $$

CREATE PROCEDURE StageSubsidy(
  IN id SMALLINT UNSIGNED,
  IN invoice_uuid BINARY(16)
)
BEGIN
  CALL VerifySubsidyStageTable();
  INSERT INTO stage_subsidy (SELECT id, invoice_uuid);
END $$

-- create a temporary staging table for the subsidies, this is done via a helper
-- method to ensure it has been created as sale writing time (subsidies are an
-- optional entity that may or may not have been called for staging)
CREATE PROCEDURE VerifySubsidyStageTable()
BEGIN
  CREATE TEMPORARY TABLE IF NOT EXISTS stage_subsidy (
    id INTEGER,
    invoice_uuid BINARY(16)
  );
END $$

CREATE PROCEDURE VerifyInvoicingFeeStageTable()
BEGIN
  CREATE TEMPORARY TABLE IF NOT EXISTS stage_invoicing_fee (
    id INTEGER,
    invoice_uuid BINARY(16)
  );
END $$

/*
  CALL WriteInvoice(uuid)

  DESCRIPTION
  This procedure takes all staged records and begins to compose the invoice from
  them.  Keep in mind:
    1) Invoicing Fees place percentage increase on the invoice in proportion
      to the base invoice cost.
    2) Subsidies place a percentage reduction on the invoice in proportion to
      the invoice cost.
    3) Invoicing Fees are applied first, then Subsidies are applied to the
      adjusted invoice amount.

  The final value of this algorithm is recorded in the invoices table as the
  cost of the invoice.  In the posting journal, the invoice...
*/

CREATE PROCEDURE WriteInvoice(
  IN uuid BINARY(16)
)
BEGIN
  -- running calculation variables
  DECLARE items_cost decimal(19, 4);
  DECLARE invoicing_fees_cost decimal(19, 4);
  DECLARE total_cost_to_debtor decimal(19, 4);
  DECLARE total_subsidy_cost decimal(19, 4);
  DECLARE total_subsidised_cost decimal(19, 4);

  -- ensure that all optional entities have staging tables available, it is
  -- possible that the invoice has not invoked methods to stage subsidies and
  -- invoicing fees if they are not relevant - this makes sure the tables
  -- exist for queries within this method.
  CALL VerifySubsidyStageTable();
  CALL VerifyInvoicingFeeStageTable();

  -- invoice details
  INSERT INTO invoice (
    project_id, uuid, cost, debtor_uuid, service_id, user_id, date, description
  )
  SELECT * FROM stage_invoice WHERE stage_invoice.uuid = uuid;

  -- invoice item details
  INSERT INTO invoice_item (
    uuid, inventory_uuid, quantity, transaction_price, inventory_price, debit,
    credit, invoice_uuid
  )

  SELECT * from stage_invoice_item WHERE stage_invoice_item.invoice_uuid = uuid;

  -- Total cost of all invoice items.  This is important to determine how much
  -- the invoicing fees
  SET items_cost = (
    SELECT SUM(credit) as cost FROM invoice_item where invoice_uuid = uuid
  );

  -- calculate invoicing fee based on total item cost
  INSERT INTO invoice_invoicing_fee (invoice_uuid, value, invoicing_fee_id)
  SELECT uuid, (invoicing_fee.value / 100) * items_cost, invoicing_fee.id
  FROM invoicing_fee WHERE id in (
    SELECT id FROM stage_invoicing_fee where invoice_uuid = uuid
  );

  -- total cost of all invoice items and invoicing fees
  SET invoicing_fees_cost = (
    SELECT IFNULL(SUM(value), 0) AS value
    FROM invoice_invoicing_fee
    WHERE invoice_uuid = uuid
  );

  -- cost so far to the debtor
  SET total_cost_to_debtor = items_cost + invoicing_fees_cost;

  -- calculate subsidy cost based on total cost to debtor
  INSERT INTO invoice_subsidy (invoice_uuid, value, subsidy_id)
  SELECT uuid, (subsidy.value / 100) * total_cost_to_debtor, subsidy.id
  FROM subsidy WHERE id in (
    SELECT id FROM stage_subsidy where invoice_uuid = uuid
  );

  -- calculate final value debtor must pay based on subsidised costs
  SET total_subsidy_cost = (
    SELECT IFNULL(SUM(value), 0) AS value
    FROM invoice_subsidy
    WHERE invoice_uuid = uuid
  );

  SET total_subsidised_cost = total_cost_to_debtor - total_subsidy_cost;

  -- update relevant fields to represent final costs
  UPDATE invoice SET cost = total_subsidised_cost WHERE invoice.uuid = uuid;

  -- return information relevant to the final calculated and written bill
  SELECT items_cost, invoicing_fees_cost, total_cost_to_debtor,
    total_subsidy_cost, total_subsidised_cost;
END $$


/*
  CALL PostInvoice(uuid);

  DESCRIPTION
  This procedure is called after an invoice is created and written into the
  `invoice` and `invoice_item` tables.  This procedure sets up the initial
  variable definitions before copying rows from the invoice tables into the
  posting journal.  It also performs basic checks for data integrity - that
  every account is properly defined.
*/
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
  DECLARE current_exchange_rate DECIMAL(19, 8) UNSIGNED;
  DECLARE enterprise_currency_id TINYINT(3) UNSIGNED;
  DECLARE transaction_id VARCHAR(100);
  DECLARE gain_account_id INT UNSIGNED;
  DECLARE loss_account_id INT UNSIGNED;

  DECLARE verify_invalid_accounts SMALLINT(5);

  -- populate initial values specifically for this invoice
  SELECT invoice.date, enterprise.id, project.id, enterprise.currency_id
    INTO date, enterprise_id, project_id, currency_id
  FROM invoice JOIN project JOIN enterprise ON
    invoice.project_id = project.id AND
    project.enterprise_id = enterprise.id
  WHERE invoice.uuid = uuid;

  -- populate core set-up values
  CALL PostingSetupUtil(
    date, enterprise_id, project_id, currency_id, current_fiscal_year_id,
    current_period_id, current_exchange_rate, enterprise_currency_id,
    transaction_id, gain_account_id, loss_account_id
  );

  -- Check that all invoice items have sales accounts - if they do not the
  -- transaction will be unbalanced and the account_id will be NULL
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
    SET MESSAGE_TEXT =
      'A NULL sales account has been found for an inventory item in this invoice.';
  END IF;

  -- now that we are sure that we have all error handled, lets go into the
  CALL CopyInvoiceToPostingJournal(
    uuid, transaction_id, project_id, current_fiscal_year_id, current_period_id,
    currency_id
  );

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
    WHERE date BETWEEN fy.start_date
      AND DATE(ADDDATE(fy.start_date, INTERVAL fy.number_of_months MONTH))
      AND fy.enterprise_id = enterprise_id
  );

  SET current_period_id = (
    SELECT id FROM period AS p
    WHERE DATE(date) BETWEEN DATE(p.start_date) AND DATE(p.end_date)
      AND p.fiscal_year_id = current_fiscal_year_id
  );

  SELECT e.gain_account_id, e.loss_account_id, e.currency_id
    INTO gain_account, loss_account, enterprise_currency_id
  FROM enterprise AS e WHERE e.id = enterprise_id;

  -- this uses the currency id passed in as a dependency
  SET current_exchange_rate = GetExchangeRate(enterprise_id, currency_id, date);
  SET current_exchange_rate = (
    SELECT IF(currency_id = enterprise_currency_id, 1, current_exchange_rate)
  );

  -- get the transaction id from the GenerateTransactionId function
  SET transaction_id = GenerateTransactionId(project_id);

  -- error handling
  CALL PostingJournalErrorHandler(
    enterprise_id, project_id, current_fiscal_year_id,
    current_period_id, current_exchange_rate, date
  );
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

  DECLARE transIdNumberPart INT;

  -- caution variables
  DECLARE cid BINARY(16);
  DECLARE cbalance DECIMAL(19,4);
  DECLARE cdate DATETIME;
  DECLARE cdescription TEXT;

 -- cursor for debtor's cautions
 -- TODO(@jniles) - remove MAX() call.  This violates ONLY_FULL_GROUP_BY.
  DECLARE curse CURSOR FOR
    SELECT c.id, c.date, MAX(c.description), SUM(c.credit - c.debit) AS balance FROM (

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
    GROUP BY c.id, c.date
    HAVING balance > 0
    ORDER BY c.date;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  SET transIdNumberPart = GetTransactionNumberPart(transId, projectId);

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
    IF cbalance >= icost THEN

      -- write the cost value from into the posting journal
      INSERT INTO posting_journal
          (uuid, project_id, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
          record_uuid, description, account_id, debit, credit, debit_equiv,
          credit_equiv, currency_id, entity_uuid, reference_uuid,
          user_id, transaction_type_id)
        VALUES (
          HUID(UUID()), projectId, fiscalYearId, periodId, transId, transIdNumberPart, idate, iuuid, cdescription,
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
          uuid, project_id, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
          record_uuid, description, account_id, debit, credit, debit_equiv,
          credit_equiv, currency_id, entity_uuid, reference_uuid,
          user_id, transaction_type_id
        ) VALUES (
          HUID(UUID()), projectId, fiscalYearId, periodId, transId, transIdNumberPart, idate,
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
      uuid, project_id, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
      record_uuid, description, account_id, debit, credit, debit_equiv,
      credit_equiv, currency_id, entity_uuid, user_id, transaction_type_id
    ) VALUES (
      HUID(UUID()), projectId, fiscalYearId, periodId, transId, transIdNumberPart, idate,
      iuuid, idescription, iaccountId, icost, 0, icost, 0,
      currencyId, ientityId, iuserId, 11
    );
  END IF;

  -- copy the invoice_items into the posting_journal
  INSERT INTO posting_journal (
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, transaction_type_id, user_id
  )
   SELECT
    HUID(UUID()), i.project_id, fiscalYearId, periodId, transId, transIdNumberPart, i.date, i.uuid,
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
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, transaction_type_id, user_id
  ) SELECT
    HUID(UUID()), i.project_id, fiscalYearId, periodId, transId, transIdNumberPart, i.date, i.uuid,
    i.description, su.account_id, isu.value, 0, isu.value, 0, currencyId, 11,
    i.user_id
  FROM invoice AS i JOIN invoice_subsidy AS isu JOIN subsidy AS su ON
    i.uuid = isu.invoice_uuid AND
    isu.subsidy_id = su.id
  WHERE i.uuid = iuuid;

  -- copy the invoice_invoicing_fee records into the posting_journal (credits)
  INSERT INTO posting_journal (
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, transaction_type_id, user_id
  ) SELECT
    HUID(UUID()), i.project_id, fiscalYearId, periodId, transId, transIdNumberPart, i.date, i.uuid,
    i.description, b.account_id, 0, ib.value, 0, ib.value, currencyId, 11,
    i.user_id
  FROM invoice AS i JOIN invoice_invoicing_fee AS ib JOIN invoicing_fee AS b ON
    i.uuid = ib.invoice_uuid AND
    ib.invoicing_fee_id = b.id
  WHERE i.uuid = iuuid;
END $$

/*
CALL LinkPrepaymentsToInvoice(invoiceUuid, debtorUuid);

This procedure establishes links between payments that have occurred before
goods or services have been billed.  At invoicing time, the system will check
if the debtor has a creditor balance.  If so, it will attempt to "link" the
prepayments by calling the LinkPrepaymentsToInvoice() method.

The following steps happen:
 1. All unbalanced cash payments before the invoice date are collected, along
with their balances.
 2. For each cash payment, a voucher line is added debiting the debtor and
crediting the invoice.  This line's value is MIN(invoice cost, cash value).
 3. The reference_uuid column is populated with the assigned cash payment's uuid.
 4. The invoice_cost is reduced by MIN(invoice cost, cash value).
 5. If invoice_cost is 0, break.  Otherwise, continue until out of cash payments.

This will either:
 1. Halt after the invoice has been completely allocated to a series of cash
payments.
OR
 2. Halt once all cash payments have been assigned to the invoice. There may or
may not be a remaining balance on the invoice.
*/
CREATE PROCEDURE LinkPrepaymentsToInvoice(
  IN invoice_uuid BINARY(16),
  IN debtor_uuid BINARY(16),
  IN description TEXT
)
BEGIN
  -- local variables
  DECLARE done INT DEFAULT FALSE;

  -- these are used in the loop
  DECLARE recordUuid BINARY(16);
  DECLARE recordBalance DECIMAL(19,4);
  DECLARE amountToAllocate DECIMAL(19,4);
  DECLARE allocationAmount DECIMAL(19,4);
  DECLARE totalAllocated DECIMAL(19,4);

  -- voucher properties
  DECLARE vUuid BINARY(16);
  DECLARE enterpriseCurrencyId SMALLINT(5);
  DECLARE linkTransactionTypeId SMALLINT(5);
  DECLARE debtorAccountId INT(10);

  DECLARE curse CURSOR FOR
    SELECT payment.uuid, payment.balance FROM stage_payment_balances AS payment;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  -- TODO(@jniles): propose issue for how to deal with this kind of transaction
  -- type that is automatically generated by the system.
  SET linkTransactionTypeId = 19;
  SET vUuid = HUID(UUID());

  SET enterpriseCurrencyId = (
    SELECT currency_id FROM enterprise
    JOIN project ON enterprise.id = project.enterprise_id
    JOIN invoice ON invoice.project_id = project.id
    WHERE invoice.uuid = invoice_uuid
    LIMIT 1
  );

  SET debtorAccountId = (
    SELECT account_id FROM debtor_group JOIN debtor
    ON debtor_group.uuid = debtor.group_uuid
    WHERE debtor.uuid = debtor_uuid
  );

  -- make the voucher that will link the debtor's invoices to their cautions.
  INSERT INTO voucher (uuid, date, project_id, currency_id, amount, description, user_id, type_id)
    SELECT vUuid, date, project_id, enterpriseCurrencyId, 0, description, user_id, linkTransactionTypeId
    FROM invoice WHERE invoice.uuid = invoice_uuid;

  SELECT cost INTO amountToAllocate FROM invoice WHERE uuid = invoice_uuid;

  -- set up the prepayment balances table
  CALL CalculatePrepaymentBalances(debtor_uuid);

  OPEN curse;

  allocatePrepayments: LOOP
    FETCH curse INTO recordUuid, recordBalance;

    -- if done, break
    IF done THEN
      LEAVE allocatePrepayments;
    END IF;

    -- This portion of the loop figures out how much to allocate.
    IF (amountToAllocate - recordBalance > 0) THEN
      -- Branch A: We have more to allocate than in this record, so we'll allocate
      -- the _entire_ record and keep looping.
      SET amountToAllocate = amountToAllocate - recordBalance;
      SET allocationAmount = recordBalance;
    ELSE
      -- Branch B: We have enough to cover the allocation amount in this record.
      -- Set the amount allocated to the amount required and then exit the loop.
      SET allocationAmount = amountToAllocate;
      SET amountToAllocate = 0;
      SET done = TRUE;
    END IF;

    INSERT INTO voucher_item (`uuid`, `account_id`, `debit`, `credit`, `voucher_uuid`, `document_uuid`, `entity_uuid`) VALUES (
      HUID(UUID()), debtorAccountId, allocationAmount, 0, vUuid, recordUuid, debtor_uuid
    );
  END LOOP allocatePrepayments;

  SET totalAllocated = (SELECT SUM(debit) from voucher_item WHERE voucher_uuid = vUuid);

  -- insert the final voucher item row that hits the invoice
  INSERT INTO voucher_item (`uuid`, `account_id`, `debit`, `credit`, `voucher_uuid`, `document_uuid`, `entity_uuid`)
  VALUES (HUID(UUID()), debtorAccountId, 0, totalAllocated, vUuid, invoice_uuid, debtor_uuid);

  UPDATE voucher SET amount = totalAllocated WHERE voucher.uuid = vUuid;

  CALL PostVoucher(vUuid);
END $$

CREATE PROCEDURE VerifyPrepaymentTemporaryTables()
BEGIN
  CREATE TEMPORARY TABLE IF NOT EXISTS stage_payment_records (
    uuid BINARY(16), debit DECIMAL(19,4), credit DECIMAL(19,4), date TIMESTAMP,
    INDEX uuid (uuid)
  );

  CREATE TEMPORARY TABLE IF NOT EXISTS stage_payment_references (
    uuid BINARY(16), debit DECIMAL(19,4), credit DECIMAL(19,4), date TIMESTAMP,
    INDEX uuid (uuid)
  );

  CREATE TEMPORARY TABLE IF NOT EXISTS stage_payment_balances (
    uuid BINARY(16), balance DECIMAL(19, 4), date TIMESTAMP,
    INDEX uuid (uuid)
  );
END $$

CREATE PROCEDURE CalculatePrepaymentBalances(
  IN debtor_uuid BINARY(16)
)
BEGIN
  CALL VerifyPrepaymentTemporaryTables();

  -- pull in posting_journal data
  INSERT INTO stage_payment_records
    SELECT p.record_uuid AS uuid, p.debit_equiv as debit, p.credit_equiv as credit, p.trans_date as date
    FROM posting_journal AS p
      JOIN cash c ON c.uuid = p.record_uuid
    WHERE c.debtor_uuid = debtor_uuid
      AND c.reversed = 0
      AND c.is_caution = 1
      AND p.entity_uuid IS NOT NULL;

  -- pull in general_ledger data
  INSERT INTO stage_payment_records
    SELECT p.record_uuid AS uuid, p.debit_equiv as debit, p.credit_equiv as credit, p.trans_date as date
    FROM general_ledger AS p
      JOIN cash c ON c.uuid = p.record_uuid
    WHERE c.debtor_uuid = debtor_uuid
      AND c.reversed = 0
      AND c.is_caution = 1
      AND p.entity_uuid IS NOT NULL;

  -- pull in posting_journal references
  INSERT INTO stage_payment_references
    SELECT p.reference_uuid AS uuid, p.debit_equiv as debit, p.credit_equiv as credit, p.trans_date as date
    FROM posting_journal AS p
      JOIN cash c ON c.uuid = p.reference_uuid
    WHERE c.debtor_uuid = debtor_uuid AND c.reversed = 0 AND c.is_caution = 1;

  -- pull in general_ledger references
  INSERT INTO stage_payment_references
    SELECT p.reference_uuid AS uuid, p.debit_equiv as debit, p.credit_equiv as credit, p.trans_date as date
    FROM general_ledger AS p
      JOIN cash c ON c.uuid = p.reference_uuid
    WHERE c.debtor_uuid = debtor_uuid AND c.reversed = 0 AND c.is_caution = 1;

  INSERT INTO stage_payment_balances
    SELECT zz.uuid, zz.balance, zz.date
    FROM (
      SELECT ledger.uuid, SUM(ledger.credit - ledger.debit) AS balance, MIN(ledger.date) AS date
      FROM (
        SELECT records.uuid, records.debit, records.credit, records.date FROM stage_payment_records AS records
      UNION ALL
        SELECT refs.uuid, refs.debit, refs.credit, refs.date FROM stage_payment_references AS refs
      ) AS ledger
      GROUP BY ledger.uuid
      HAVING balance <> 0
    ) AS zz ORDER BY zz.date;
END $$


/*
PROCEDURE UnbalancedInvoicePayments

USAGE: Call UnbalancedInvoicePayments(dateFrom, dateTo);

Description:
This SP retrieves the balance of invoices made during a period of time.  It
filters out invoices that are reversed (they should be balanced by default),
as well as balanced invoices.

*/
DROP PROCEDURE IF EXISTS UnbalancedInvoicePayments$$
CREATE PROCEDURE UnbalancedInvoicePayments(
  IN dateFrom DATE,
  IN dateTo DATE
) BEGIN

  -- this holds all the invoices that were made during the period
  -- two copies are needed for the UNION ALL query.
  DROP TABLE IF EXISTS tmp_invoices_1;
  CREATE TEMPORARY TABLE tmp_invoices_1 (INDEX uuid (uuid)) AS
    SELECT invoice.uuid, invoice.debtor_uuid, invoice.date
    FROM invoice
    WHERE
      DATE(invoice.date) BETWEEN DATE(dateFrom) AND DATE(dateTo)
      AND reversed = 0
    ORDER BY invoice.date;

  DROP TABLE IF EXISTS tmp_invoices_2;
  CREATE TEMPORARY TABLE tmp_invoices_2 AS SELECT * FROM tmp_invoices_1;

  -- This holds the invoices from the PJ/GL
  DROP TEMPORARY TABLE IF EXISTS tmp_records;
  CREATE TABLE tmp_records AS
    SELECT ledger.record_uuid AS uuid, ledger.debit_equiv, ledger.credit_equiv
    FROM (
      SELECT pj.record_uuid, pj.debit_equiv, pj.credit_equiv
      FROM posting_journal pj
        JOIN tmp_invoices_1 i ON i.uuid = pj.record_uuid
          AND pj.entity_uuid = i.debtor_uuid

      UNION ALL

      SELECT gl.record_uuid, gl.debit_equiv, gl.credit_equiv
      FROM general_ledger gl
        JOIN tmp_invoices_2 i ON i.uuid = gl.record_uuid
            AND gl.entity_uuid = i.debtor_uuid
  ) AS ledger;

  -- this holds the references/payments against the invoices
  DROP TABLE IF EXISTS tmp_references;
  CREATE TEMPORARY TABLE tmp_references AS
    SELECT ledger.reference_uuid AS uuid, ledger.debit_equiv, ledger.credit_equiv
    FROM (
      SELECT pj.reference_uuid, pj.debit_equiv, pj.credit_equiv
      FROM posting_journal pj
        JOIN tmp_invoices_1 i ON i.uuid = pj.reference_uuid
          AND pj.entity_uuid = i.debtor_uuid

      UNION ALL

      SELECT gl.reference_uuid, gl.debit_equiv, gl.credit_equiv
      FROM general_ledger gl
        JOIN tmp_invoices_2 i ON i.uuid = gl.reference_uuid
          AND gl.entity_uuid = i.debtor_uuid
  ) AS ledger;

  -- combine invoices and references to get the balance of each invoice.
  -- note that we filter out balanced invoices
  DROP TABLE IF EXISTS tmp_invoice_balances;
  CREATE TEMPORARY TABLE tmp_invoice_balances AS
    SELECT z.uuid, SUM(z.debit_equiv) AS debit_equiv,
      SUM(z.credit_equiv) AS credit_equiv,
      SUM(z.debit_equiv) - SUM(z.credit_equiv) AS balance
    FROM (
      SELECT i.uuid, i.debit_equiv, i.credit_equiv FROM tmp_records i
      UNION ALL
      SELECT p.uuid, p.debit_equiv, p.credit_equiv FROM tmp_references p
    )z
    GROUP BY z.uuid
    HAVING balance <> 0;

  -- even though this column is called "balance", it is actually the amount remaining
  -- on the invoice.
  SELECT em.text AS debtorReference, debtor.text AS debtorName, balances.debit_equiv AS debit,
    balances.credit_equiv AS credit, iv.date AS creation_date, balances.balance,
     (balances.credit_equiv / IF(balances.debit_equiv = 0, 1, balances.debit_equiv )) AS paymentPercentage,
    dm.text AS reference
  FROM tmp_invoices_1 AS iv
    JOIN tmp_invoice_balances AS balances ON iv.uuid = balances.uuid
    LEFT JOIN document_map AS dm ON dm.uuid = iv.uuid
    JOIN debtor ON debtor.uuid = iv.debtor_uuid
    LEFT JOIN entity_map AS em ON em.uuid = iv.debtor_uuid
  ORDER BY iv.date;
END$$


-- this Procedure help to make quick analyse about unbalanced invoice
-- it create a table name 'unbalancedInvoices' that can be used by the analyser
DROP PROCEDURE IF EXISTS UnbalancedInvoicePaymentsTable$$
CREATE PROCEDURE UnbalancedInvoicePaymentsTable(
  IN dateFrom DATE,
  IN dateTo DATE
) BEGIN

  -- this holds all the invoices that were made during the period
  -- two copies are needed for the UNION ALL query.
  DROP TEMPORARY TABLE IF EXISTS tmp_invoices_1;
  CREATE TEMPORARY TABLE tmp_invoices_1 (INDEX uuid (uuid)) AS
    SELECT invoice.uuid, invoice.debtor_uuid, invoice.date
    FROM invoice
    WHERE
      DATE(invoice.date) BETWEEN DATE(dateFrom) AND DATE(dateTo)
      AND reversed = 0
    ORDER BY invoice.date;

  DROP TEMPORARY TABLE IF EXISTS tmp_invoices_2;
  CREATE TEMPORARY TABLE tmp_invoices_2 AS SELECT * FROM tmp_invoices_1;

  DROP TEMPORARY TABLE IF EXISTS tmp_records;
  -- This holds the invoices from the PJ/GL
  CREATE TEMPORARY TABLE tmp_records AS
    SELECT ledger.record_uuid AS uuid, ledger.debit_equiv, ledger.credit_equiv
    FROM (
      SELECT pj.record_uuid, pj.debit_equiv, pj.credit_equiv
      FROM posting_journal pj
        JOIN tmp_invoices_1 i ON i.uuid = pj.record_uuid
          AND pj.entity_uuid = i.debtor_uuid

      UNION ALL

      SELECT gl.record_uuid, gl.debit_equiv, gl.credit_equiv
      FROM general_ledger gl
        JOIN tmp_invoices_2 i ON i.uuid = gl.record_uuid
            AND gl.entity_uuid = i.debtor_uuid
  ) AS ledger;

  -- this holds the references/payments against the invoices
  DROP TEMPORARY TABLE IF EXISTS tmp_references;
  CREATE TEMPORARY TABLE tmp_references AS
    SELECT ledger.reference_uuid AS uuid, ledger.debit_equiv, ledger.credit_equiv
    FROM (
      SELECT pj.reference_uuid, pj.debit_equiv, pj.credit_equiv
      FROM posting_journal pj
        JOIN tmp_invoices_1 i ON i.uuid = pj.reference_uuid
          AND pj.entity_uuid = i.debtor_uuid

      UNION ALL

      SELECT gl.reference_uuid, gl.debit_equiv, gl.credit_equiv
      FROM general_ledger gl
        JOIN tmp_invoices_2 i ON i.uuid = gl.reference_uuid
          AND gl.entity_uuid = i.debtor_uuid
  ) AS ledger;

  -- combine invoices and references to get the balance of each invoice.
  -- note that we filter out balanced invoices
  DROP TEMPORARY TABLE IF EXISTS tmp_invoice_balances;
  CREATE TEMPORARY TABLE tmp_invoice_balances AS
    SELECT z.uuid, SUM(z.debit_equiv) AS debit_equiv,
      SUM(z.credit_equiv) AS credit_equiv,
      SUM(z.debit_equiv) - SUM(z.credit_equiv) AS balance
    FROM (
      SELECT i.uuid, i.debit_equiv, i.credit_equiv FROM tmp_records i
      UNION ALL
      SELECT p.uuid, p.debit_equiv, p.credit_equiv FROM tmp_references p
    )z
    GROUP BY z.uuid
    HAVING balance <> 0;

  -- even though this column is called "balance", it is actually the amount remaining
  -- on the invoice.

  DROP TEMPORARY TABLE IF EXISTS unbalanced_invoices;
  CREATE TEMPORARY TABLE `unbalanced_invoices` AS (
    SELECT BUID(ivc.uuid) as invoice_uuid , em.text AS debtorReference, debtor.text AS debtorName,
      BUID(debtor.uuid) as debtorUuid,
      balances.debit_equiv AS debit,
      balances.credit_equiv AS credit, iv.date AS creation_date, balances.balance,
      dm.text AS reference, ivc.project_id, p.name as 'projectName', dbtg.name as 'debtorGroupName',
      s.name as 'serviceName', s.id as 'serviceId',
      ((balances.credit_equiv / IF(balances.debit_equiv = 0, 1, balances.debit_equiv )*100)) AS paymentPercentage
    FROM tmp_invoices_1 AS iv
        JOIN invoice ivc ON ivc.uuid = iv.uuid
        JOIN service s On s.id = ivc.service_id
        JOIN debtor dbt ON ivc.debtor_uuid = dbt.uuid
        JOIN debtor_group dbtg ON dbtg.uuid = dbt.group_uuid
        JOIN project p ON p.id = ivc.project_id
      JOIN tmp_invoice_balances AS balances ON iv.uuid = balances.uuid
      LEFT JOIN document_map AS dm ON dm.uuid = iv.uuid
      JOIN debtor ON debtor.uuid = iv.debtor_uuid
      LEFT JOIN entity_map AS em ON em.uuid = iv.debtor_uuid
    ORDER BY iv.date
  );
END$$

DELIMITER ;
