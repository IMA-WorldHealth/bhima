-- Stored Functions and Procedures

DELIMITER $$

-- converts a hex uuid (36 chars) into a binary uuid (16 bytes)
CREATE FUNCTION HUID(_uuid CHAR(36))
RETURNS BINARY(16) DETERMINISTIC
RETURN UNHEX(REPLACE(_uuid, '-', ''));
$$

-- converts a binary uuid (16 bytes) to dash-delimited hex UUID (36 characters)
CREATE FUNCTION BUID(b BINARY(16))
RETURNS CHAR(36) DETERMINISTIC
BEGIN
  DECLARE hex CHAR(32);
  SET hex = HEX(b);
  RETURN LCASE(CONCAT_WS('-', SUBSTR(hex,1, 8), SUBSTR(hex, 9,4), SUBSTR(hex, 13,4), SUBSTR(hex, 17,4), SUBSTR(hex, 21, 12)));
END
$$

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
    create temporary table stage_invoice 
    (select project_id, uuid, cost, debtor_uuid, service_id, user_id, date, description, is_distributable);
  ELSE 
    insert into stage_invoice
    (select project_id, uuid, cost, debtor_uuid, service_id, user_id, date, description, is_distributable);
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
  -- for querries within this method
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
  WHERE uuid = uuid;

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
    SELECT id FROM fiscal_year 
    WHERE date BETWEEN start_date AND DATE(ADDDATE(start_date, INTERVAL number_of_months MONTH)) AND enterprise_id = enterprise_id);

  SET current_period_id = (
    SELECT id from period 
    WHERE Date(date) BETWEEN Date(start_date) AND Date(end_date) AND fiscal_year_id = current_fiscal_year_id);
  
  SET enterprise_currency_id = (SELECT currency_id FROM enterprise WHERE id = enterprise_id);
  
  -- this uses the currency id passed in as a dependency
  SET current_exchange_rate = (
    SELECT rate FROM exchange_rate 
    WHERE enterprise_id = enterprise_id AND currency_id = currency_id AND date <= date 
    ORDER BY date DESC LIMIT 1
  );

  SET current_exchange_rate = (SELECT IF(currency_id = enterprise_currency_id, 1, 1/current_exchange_rate));
  
  SELECT gain_account_id, loss_account_id
  INTO gain_account, loss_account
  FROM enterprise WHERE id = enterprise_id;

  SET transaction_id = GenerateTransactionId(project_id);

  -- error handling 
  CALL PostingJournalErrorHandler(enterprise_id, project_id, current_fiscal_year_id, current_period_id, current_exchange_rate, date);
END $$

-- returns a formatted transaction ID based on a patients project abbreviation and the current transaction number
CREATE FUNCTION GenerateTransactionId(
  project_id SMALLINT(5)
)
RETURNS VARCHAR(100) DETERMINISTIC
BEGIN
DECLARE trans_id_length TINYINT(1) DEFAULT 4;

RETURN ( 
SELECT CONCAT(abbr, IFNULL(MAX(increment), 1)) AS id 
FROM (
  SELECT project.abbr, MAX(FLOOR(SUBSTR(trans_id, trans_id_length))) + 1 AS increment
  FROM posting_journal JOIN project ON posting_journal.project_id = project.id
  WHERE posting_journal.project_id = project_id
UNION
  SELECT project.abbr, MAX(FLOOR(SUBSTR(trans_id, trans_id_length))) + 1 AS increment
  FROM general_ledger JOIN project ON general_ledger.project_id = project.id
  WHERE general_ledger.project_id = project_id)c
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
  DECLARE icost DECIMAL;
  DECLARE ientityId BINARY(16);
  DECLARE iuserId INT;
  DECLARE idescription TEXT;
  DECLARE iaccountId INT;

  -- caution variables
  DECLARE cid BINARY(16);
  DECLARE cbalance DECIMAL;
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
        SET icost := icost - cbalance;

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

-- Handles the Cash Table's Rounding
-- CREATE PROCEDURE HandleCashRounding(
--   uuid BINARY(16),
--   enterpriseCurrencyId INT,
--   exchange DECIMAL
-- )
-- BEGIN
--
--   -- get the total amount paid
--   SELECT cash.amount, cash.currency_id, is_caution INTO
--     @amount, @currencyId, @isCaution
--   FROM cash WHERE cash.uuid = uuid;
--
--   -- only continue if we are paying against a invoice in a different currency than
--   -- the enterprise currency
--   IF @isCaution IS NOT NULL AND @currencyId <> enterpriseCurrencyId THEN
--
--     -- NOTE: this should really take into account the balance of the invoices
--     -- including previous payments.
--     -- TODO: find a way to sum all previous patient invoices in the posting journal
--     -- after figuring out posting.
--
--   END IF;
-- END
-- $$

DELIMITER ;
