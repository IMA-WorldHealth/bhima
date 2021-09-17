-- from https://stackoverflow.com/questions/173814/using-alter-to-drop-a-column-if-it-exists-in-mysql

DROP FUNCTION IF EXISTS bh_column_exists;

DELIMITER $$
CREATE FUNCTION bh_column_exists(
  tname VARCHAR(64) ,
  cname VARCHAR(64)
)
  RETURNS BOOLEAN
  READS SQL DATA
  BEGIN
    RETURN 0 < (SELECT COUNT(*)
      FROM `INFORMATION_SCHEMA`.`COLUMNS`
      WHERE `TABLE_SCHEMA` = SCHEMA()
        AND `TABLE_NAME` = tname
        AND `COLUMN_NAME` = cname);
  END $$
DELIMITER ;

-- drop_column_if_exists:

DROP PROCEDURE IF EXISTS drop_column_if_exists;

DELIMITER $$
CREATE PROCEDURE drop_column_if_exists(
  IN tname VARCHAR(64),
  IN cname VARCHAR(64)
)
BEGIN
    IF bh_column_exists(tname, cname)
    THEN
      SET @drop_column_if_exists = CONCAT("ALTER TABLE `", tname, "` DROP COLUMN `", cname, "`");
      PREPARE drop_query FROM @drop_column_if_exists;
      EXECUTE drop_query;
    END IF;
END $$
DELIMITER ;

-- add_column_if_missing:

DROP PROCEDURE IF EXISTS add_column_if_missing;

DELIMITER $$
CREATE PROCEDURE add_column_if_missing(
  IN tname VARCHAR(64),
  IN cname VARCHAR(64),
  IN typeinfo VARCHAR(128)
)
BEGIN
  IF NOT bh_column_exists(tname, cname)
  THEN
    SET @add_column_if_missing = CONCAT("ALTER TABLE `", tname, "` ADD COLUMN `", cname, "` ", typeinfo);
    PREPARE add_query FROM @add_column_if_missing;
    EXECUTE add_query;
  END IF;
END $$
DELIMITER ;


-- From  https://stackoverflow.com/questions/2480148/how-can-i-employ-if-exists-for-creating-or-dropping-an-index-in-mysql
-- This procedure try to drop a table index if it exists


DROP FUNCTION IF EXISTS index_exists;

DELIMITER $$
CREATE FUNCTION index_exists(
  theTable VARCHAR(64),
  theIndexName VARCHAR(64)
)
  RETURNS BOOLEAN
  READS SQL DATA
  BEGIN
    RETURN 0 < (SELECT COUNT(*) AS exist FROM information_schema.statistics WHERE TABLE_SCHEMA = DATABASE() and table_name =
theTable AND index_name = theIndexName);
  END $$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS drop_index_if_exists $$
CREATE PROCEDURE drop_index_if_exists(in theTable varchar(128), in theIndexName varchar(128) )
BEGIN
 IF(index_exists (theTable, theIndexName)) THEN
   SET @s = CONCAT('DROP INDEX ' , theIndexName , ' ON ' , theTable);
   PREPARE stmt FROM @s;
   EXECUTE stmt;
 END IF;
END $$
DELIMITER ;


--

DELIMITER $$
DROP FUNCTION IF EXISTS Constraint_exists$$
CREATE FUNCTION Constraint_exists(
  theTable VARCHAR(64),
  theConstraintName VARCHAR(64)
)
  RETURNS BOOLEAN
  READS SQL DATA
  BEGIN
    RETURN 0 < (
     SELECT COUNT(*) AS nbr
     FROM
      INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
     WHERE CONSTRAINT_SCHEMA = DATABASE()
     AND TABLE_NAME= theTable
    AND  CONSTRAINT_NAME = theConstraintName
   );
  END $$

DROP PROCEDURE IF EXISTS add_constraint_if_missing;
CREATE PROCEDURE add_constraint_if_missing(
  IN tname VARCHAR(64),
  IN cname VARCHAR(64),
  IN cdetails VARCHAR(128)
)
BEGIN
  IF NOT Constraint_exists(tname, cname)
  THEN
    SET @add_constraint_if_missing = CONCAT("ALTER TABLE `", tname, "` ADD CONSTRAINT `", cname, "` ", cdetails);
    PREPARE add_query FROM @add_constraint_if_missing;
    EXECUTE add_query;
  END IF;
END $$
DELIMITER ;

DELIMITER $$

-- this procedure will be used for "ALTER TABLE table_name DROP FOREIGN KEY constraint_name";
-- example : CALL drop_foreign_key('table_name', 'constraint_name');

DROP PROCEDURE IF EXISTS drop_foreign_key $$
CREATE PROCEDURE drop_foreign_key(in theTable varchar(128), in theConstraintName varchar(128) )
BEGIN
 IF(Constraint_exists(theTable, theConstraintName) > 0) THEN

   SET @s = CONCAT(' ALTER TABLE ' , theTable , ' DROP FOREIGN KEY  ' , theConstraintName);
   PREPARE stmt FROM @s;
   EXECUTE stmt;
 END IF;
END $$

DELIMITER ;

/**
author: @lomamech
date: 2021-09-16
description: Add column cost_center_id and principal_center_id in Voucher Item
*/

DELIMITER $$
DROP PROCEDURE IF EXISTS PostVoucher;

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
  DECLARE current_exchange_rate DECIMAL(19, 8) UNSIGNED;
  DECLARE enterprise_currency_id TINYINT(3) UNSIGNED;
  DECLARE transaction_id VARCHAR(100);
  DECLARE gain_account_id INT UNSIGNED;
  DECLARE loss_account_id INT UNSIGNED;


  DECLARE transIdNumberPart INT;
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

  SET transIdNumberPart = GetTransactionNumberPart(transaction_id, project_id);

  -- POST to the posting journal
  -- @TODO(sfount) transaction ID number reference should be fetched seperately from full transaction ID to model this relationship better
  INSERT INTO posting_journal (uuid, project_id, fiscal_year_id, period_id,
    trans_id, trans_id_reference_number, trans_date, record_uuid, description, account_id, debit,
    credit, debit_equiv, credit_equiv, currency_id, entity_uuid,
    reference_uuid, comment, transaction_type_id, cost_center_id, principal_center_id, user_id)
  SELECT
    HUID(UUID()), v.project_id, fiscal_year_id, period_id, transaction_id, transIdNumberPart, v.date,
    v.uuid, IF((vi.description IS NULL), v.description, vi.description), vi.account_id, vi.debit, vi.credit,
    vi.debit * (1 / current_exchange_rate), vi.credit * (1 / current_exchange_rate), v.currency_id,
    vi.entity_uuid, vi.document_uuid, NULL, v.type_id, vi.cost_center_id, vi.principal_center_id, v.user_id
  FROM voucher AS v JOIN voucher_item AS vi ON v.uuid = vi.voucher_uuid
  WHERE v.uuid = uuid;

  -- NOTE: this does not handle any rounding - it simply converts the currency as needed.
END $$


DELIMITER $$
DROP PROCEDURE IF EXISTS PostToGeneralLedger;

CREATE PROCEDURE PostToGeneralLedger()
BEGIN
  DECLARE isInvoice, isCash, isVoucher INT;

  -- write into the posting journal
  INSERT INTO general_ledger (
    project_id, uuid, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, entity_uuid, reference_uuid, comment, transaction_type_id, cost_center_id, principal_center_id, user_id
  ) SELECT project_id, uuid, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date, posting_journal.record_uuid,
    description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id,
    entity_uuid, reference_uuid, comment, transaction_type_id, cost_center_id, principal_center_id, user_id
  FROM posting_journal JOIN stage_trial_balance_transaction AS staged
    ON posting_journal.record_uuid = staged.record_uuid;

  -- write into period_total
  INSERT INTO period_total (
    account_id, credit, debit, fiscal_year_id, enterprise_id, period_id
  )
  SELECT account_id, SUM(credit_equiv) AS credit, SUM(debit_equiv) as debit,
    fiscal_year_id, project.enterprise_id, period_id
  FROM posting_journal JOIN stage_trial_balance_transaction JOIN project
    ON posting_journal.record_uuid = stage_trial_balance_transaction.record_uuid
    AND project_id = project.id
  GROUP BY fiscal_year_id, period_id, account_id
  ON DUPLICATE KEY UPDATE credit = credit + VALUES(credit), debit = debit + VALUES(debit);

  -- write into cost_center_aggregate
  INSERT INTO cost_center_aggregate (
    period_id, debit, credit, cost_center_id, principal_center_id
  )
	SELECT period_id, SUM(debit_equiv) AS debit, SUM(credit_equiv) AS credit, cost_center_id, principal_center_id
	FROM posting_journal
	WHERE cost_center_id IS NOT NULL
	GROUP BY period_id, cost_center_id, principal_center_id
  ON DUPLICATE KEY UPDATE credit = credit + VALUES(credit), debit = debit + VALUES(debit);

  -- remove from posting journal
  DELETE FROM posting_journal WHERE record_uuid IN (SELECT record_uuid FROM stage_trial_balance_transaction);

  -- Let specify that this invoice or the cash payment is posted
  SELECT COUNT(uuid) INTO isInvoice  FROM invoice  WHERE invoice.uuid IN (SELECT record_uuid FROM stage_trial_balance_transaction);
  SELECT COUNT(uuid) INTO isCash  FROM cash  WHERE cash.uuid IN (SELECT record_uuid FROM stage_trial_balance_transaction);
  SELECT COUNT(uuid) INTO isVoucher  FROM voucher  WHERE voucher.uuid IN (SELECT record_uuid FROM stage_trial_balance_transaction);

  -- NOTE(@jniles): DO NOT OPTIMIZE THESE QUERIES.
  -- NOTE(@jniles): these queries look funny, like they could be optimized.  DO NOT DO IT.  They are purposefully nested
  -- to defeat MySQL8's _really smart_ query optimizer that optimizes them into an invalid query that crashes the posting
  -- proceedure.

  IF isInvoice > 0 THEN
    UPDATE invoice SET posted = 1 WHERE uuid IN (SELECT z.record_uuid FROM (SELECT record_uuid FROM stage_trial_balance_transaction) AS z);
  END IF;

  IF isCash > 0 THEN
    UPDATE cash SET posted = 1 WHERE uuid IN (SELECT z.record_uuid FROM (SELECT record_uuid FROM stage_trial_balance_transaction) AS z);
  END IF;

  IF isVoucher > 0 THEN
    UPDATE voucher SET posted = 1 WHERE uuid IN (SELECT z.record_uuid FROM (SELECT record_uuid FROM stage_trial_balance_transaction) AS z);
  END IF;

END $$