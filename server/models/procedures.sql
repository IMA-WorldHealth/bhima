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

DELIMITER $$
CREATE PROCEDURE GetSomeData(IN theParams VARCHAR(255))
BEGIN
  drop temporary table if exists foo;
  create temporary table foo 
  SELECT * 
  FROM patient 
  WHERE first_name = theParams COLLATE utf8_unicode_ci;
END $$

CREATE PROCEDURE CheckTable ()
BEGIN
  DECLARE `no_invoice_stage` TINYINT(1) DEFAULT 0;
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S02' SET `no_invoice_stage` = 1;
  SELECT NULL FROM `stage_invoice` LIMIT 0;
  
  IF (`no_invoice_stage` = 1) THEN 
    set @new = 5;
  ELSE 
    set @new = 10;
  END IF;

  select @new;
END $$

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
  DECLARE `no_invoice_stage` TINYINT(1) DEFAULT 0;
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S02' SET `no_invoice_stage` = 1;
  SELECT NULL FROM `stage_invoice` LIMIT 0;

  IF (`no_invoice_stage` = 1) THEN 
    set @status = CONCAT('noinvoice', current_time());
    create temporary table stage_invoice (select project_id, uuid, cost, debtor_uuid, service_id, user_id, date, description, is_distributable);
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
  DECLARE `no_invoice_item_stage` TINYINT(1) DEFAULT 0;
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S02' SET `no_invoice_item_stage` = 1;
  SELECT NULL FROM `stage_invoice_item` LIMIT 0;

  IF (`no_invoice_item_stage` = 1) THEN 
    create temporary table stage_invoice_item 
    (select uuid, inventory_uuid, quantity, transaction_price, inventory_price, debit, credit, invoice_uuid);
  ELSE 
    insert into stage_invoice_item
    (select uuid, inventory_uuid, quantity, transaction_price, inventory_price, debit, credit, invoice_uuid);
  END IF;
END $$

CREATE PROCEDURE StageBillingService(
  IN id SMALLINT UNSIGNED,
  IN invoice_uuid BINARY(16)
)
BEGIN 
  DECLARE `no_billing_service_stage` TINYINT(1) DEFAULT 0;
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S02' SET `no_billing_service_stage` = 1;
  SELECT NULL FROM `stage_billing_service` LIMIT 0;

  IF (`no_billing_service_stage` = 1) THEN 
    create temporary table stage_billing_service 
    (select id, invoice_uuid);
  ELSE 
    insert into stage_billing_service
    (select id, invoice_uuid);
  END IF;
END $$

CREATE PROCEDURE StageSubsidy(
  IN id SMALLINT UNSIGNED,
  IN invoice_uuid BINARY(16)
)
BEGIN 
  DECLARE `no_subsidy_stage` TINYINT(1) DEFAULT 0;
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S02' SET `no_subsidy_stage` = 1;
  SELECT NULL FROM `stage_subsidy` LIMIT 0;

  IF (`no_subsidy_stage` = 1) THEN 
    create temporary table stage_subsidy 
    (select id, invoice_uuid);
  ELSE 
    insert into stage_subsidy
    (select id, invoice_uuid);
  END IF;
END $$

CREATE PROCEDURE WriteSale(
  IN uuid BINARY(16)
)
BEGIN 
  DECLARE items_cost decimal(19, 4);
  DECLARE billing_services_cost decimal(19, 4);
  DECLARE total_cost_to_debtor decimal(19, 4);
  DECLARE total_subsidy_cost decimal(19, 4);
  DECLARE total_subsidised_cost decimal(19, 4);

  -- invoice 
  INSERT INTO invoice (project_id, uuid, cost, debtor_uuid, service_id, user_id, date, description, is_distributable)
  SELECT * from stage_invoice where stage_invoice.uuid = uuid;

  -- invoice items
  INSERT INTO invoice_item (uuid, inventory_uuid, quantity, transaction_price, inventory_price, debit, credit, invoice_uuid)
  SELECT * from stage_invoice_item WHERE stage_invoice_item.invoice_uuid = uuid;
  
  SET items_cost = (SELECT SUM(credit) as cost FROM invoice_item where invoice_uuid = uuid);
  
  INSERT INTO invoice_billing_service (invoice_uuid, value, billing_service_id)
  SELECT uuid, (billing_service.value / 100) * items_cost, billing_service.id
  FROM billing_service WHERE id in (SELECT id FROM stage_billing_service where invoice_uuid = uuid);
  
  SET billing_services_cost = (SELECT IFNULL(SUM(value), 0) AS value from invoice_billing_service WHERE invoice_uuid = uuid);
  SET total_cost_to_debtor = items_cost + billing_services_cost;
  
  INSERT INTO invoice_subsidy (invoice_uuid, value, subsidy_id)
  SELECT uuid, (subsidy.value / 100) * total_cost_to_debtor, subsidy.id
  FROM subsidy WHERE id in (SELECT id FROM stage_subsidy where invoice_uuid = uuid);
  
  SET total_subsidy_cost = (SELECT IFNULL(SUM(value), 0) AS value from invoice_subsidy WHERE invoice_uuid = uuid);
  SET total_subsidised_cost = total_cost_to_debtor - total_subsidy_cost;
  
  UPDATE invoice SET cost = total_subsidised_cost
  WHERE uuid = uuid;

  select items_cost, billing_services_cost, total_cost_to_debtor, total_subsidy_cost, total_subsidised_cost;  
END $$

CREATE PROCEDURE TotalNumberOfPatients(
  IN targetName VARCHAR(255)
  -- OUT total INT
)
BEGIN 
  SELECT COUNT(*)
  -- INTO total
  FROM patient 
  WHERE first_name = targetName COLLATE utf8_unicode_ci;
  -- SELECT total;
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
CREATE PROCEDURE PostPatientInvoice(
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
