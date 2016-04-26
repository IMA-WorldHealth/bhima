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
  suuid BINARY(16),  -- the UUID of the patient invoice
  transId TEXT,
  projectId INT,
  fiscalYearId INT,
  periodId INT,
  currencyId INT
)
BEGIN
  -- local variables
  DECLARE done INT DEFAULT FALSE;

  -- sale variables
  DECLARE sdate DATETIME;
  DECLARE scost DECIMAL;
  DECLARE sentityId BINARY(16);
  DECLARE suserId INT;
  DECLARE sdescription TEXT;
  DECLARE saccountId INT;

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
      WHERE reference_uuid IS NULL AND entity_uuid = sentityId AND cash.is_caution = 0
      UNION
      SELECT debit, credit, combined_ledger.date, combined_ledger.description, reference_uuid AS id
      FROM combined_ledger JOIN cash
        ON cash.uuid = combined_ledger.reference_uuid
      WHERE entity_uuid = sentityId AND cash.is_caution = 0
    ) AS c
    GROUP BY c.id
    HAVING balance > 0
    ORDER BY c.date;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  -- set the sale variables
  SELECT cost, debtor_uuid, date, user_id, description
    INTO scost, sentityId, sdate, suserId, sdescription
  FROM sale WHERE sale.uuid = suuid;

  -- set the transaction variables (account)
  SELECT account_id INTO saccountId
  FROM debtor JOIN debtor_group
   ON debtor.group_uuid = debtor_group.uuid
  WHERE debtor.uuid = sentityId;

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
          HUID(UUID()), projectId, fiscalYearId, periodId, transId, sdate, suuid, cdescription,
          saccountId, scost, 0, scost, 0, currencyId, sentityId, 'D', cid, suserId, 1
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
        SET scost := scost - cbalance;

        INSERT INTO posting_journal (
          uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
          record_uuid, description, account_id, debit, credit, debit_equiv,
          credit_equiv, currency_id, entity_uuid, entity_type, reference_uuid,
          user_id, origin_id
        ) VALUES (
          HUID(UUID()), projectId, fiscalYearId, periodId, transId, sdate,
          suuid, cdescription, saccountId, cbalance, 0, cbalance, 0,
          currencyId, sentityId, 'D', cid, suserId, 1
        );

      END IF;
    END IF;
  END LOOP;

  -- close the cursor
  CLOSE curse;

  -- if there is remainder cost, bill the debtor the full amount
  IF scost > 0 THEN
    INSERT INTO posting_journal (
      uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
      record_uuid, description, account_id, debit, credit, debit_equiv,
      credit_equiv, currency_id, entity_uuid, entity_type, user_id, origin_id
    ) VALUES (
      HUID(UUID()), projectId, fiscalYearId, periodId, transId, sdate,
      suuid, sdescription, saccountId, scost, 0, scost, 0,
      currencyId, sentityId, 'D',suserId, 1
    );
  END IF;

  -- copy the sale_items into the posting_journal
  INSERT INTO posting_journal (
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, origin_id, user_id
  ) SELECT
    HUID(UUID()), s.project_id, fiscalYearId, periodId, transId, s.date, s.uuid,
    s.description, ig.sales_account, si.debit, si.credit, si.debit, si.credit,
    currencyId, 1, s.user_id
  FROM sale AS s JOIN sale_item AS si JOIN inventory as i JOIN inventory_group AS ig ON
    s.uuid = si.sale_uuid AND
    si.inventory_uuid = i.uuid AND
    i.group_uuid = ig.uuid
  WHERE s.uuid = suuid;

  -- copy the sale_subsidy records into the posting_journal (debits)
  INSERT INTO posting_journal (
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, origin_id, user_id
  ) SELECT
    HUID(UUID()), s.project_id, fiscalYearId, periodId, transId, s.date, s.uuid,
    su.description, su.account_id, ss.value, 0, ss.value, 0, currencyId, 1,
    s.user_id
  FROM sale AS s JOIN sale_subsidy AS ss JOIN subsidy AS su ON
    s.uuid = ss.sale_uuid AND
    ss.subsidy_id = su.id
  WHERE s.uuid = suuid;

  -- copy the sale_billing_service records into the posting_journal (credits)
  INSERT INTO posting_journal (
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, origin_id, user_id
  ) SELECT
    HUID(UUID()), s.project_id, fiscalYearId, periodId, transId, s.date, s.uuid,
    b.description, b.account_id, 0, sb.value, 0, sb.value, currencyId, 1,
    s.user_id
  FROM sale AS s JOIN sale_billing_service AS sb JOIN billing_service AS b ON
    s.uuid = sb.sale_uuid AND
    sb.billing_service_id = b.id
  WHERE s.uuid = suuid;
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
--   -- only continue if we are paying against a sale in a different currency than
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
