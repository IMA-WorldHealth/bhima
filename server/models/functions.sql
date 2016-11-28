/*
  This file contains all the stored functions used in bhima's database and queries.
  It should be loaded after schema.sql.
*/

DELIMITER $$

/*
  HUID(hexUuid)

  Converts a hex uuid (36 chars) into a binary uuid (16 bytes)
*/
CREATE FUNCTION HUID(_uuid CHAR(36))
RETURNS BINARY(16) DETERMINISTIC
  RETURN UNHEX(REPLACE(_uuid, '-', ''));
$$


/*
  BUID(binaryUuid)

  Converts a binary uuid (16 bytes) to dash-delimited hex UUID (36 characters).
*/
CREATE FUNCTION BUID(b BINARY(16))
RETURNS CHAR(36) DETERMINISTIC
BEGIN
  DECLARE hex CHAR(32);
  SET hex = HEX(b);
  RETURN LCASE(CONCAT_WS('-', SUBSTR(hex,1, 8), SUBSTR(hex, 9,4), SUBSTR(hex, 13,4), SUBSTR(hex, 17,4), SUBSTR(hex, 21, 12)));
END
$$


/*
  GetExchangeRate(enterpriseId, currencyId, date)

  Returns the current exchange rate (`rate` column) for the given currency from
  the database.  It is up to the callee to determine how to treat the rate.

  @TODO Is there some way to make this do the IF() select as well?

  EXAMPLE

  SET currentExchangeRate = GetExchangeRate(enterpriseId, currencyId, date);
  SET currentExchangeRate = (SELECT IF(recordCurrencyId = enterpriseCurrencyId, 1, currentExchangeRate));
*/
CREATE FUNCTION GetExchangeRate(
  enterpriseId INT,
  currencyId INT,
  date TIMESTAMP
)
RETURNS DECIMAL(19, 8) DETERMINISTIC
BEGIN
  RETURN (
    SELECT e.rate FROM exchange_rate AS e
    WHERE e.enterprise_id = enterpriseId AND e.currency_id = currencyId AND e.date <= date
    ORDER BY e.date DESC LIMIT 1
  );
END $$


/*
  GenerateTransactionId(projectId)

  Returns a new transaction id to be stored in the database by scanning for used
  ids in the posting_journal and general_ledger tables.

  EXAMPLE

  SET transId = GenerateTransactionid(projectid);
*/
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
      GROUP BY abbr
    UNION
      SELECT project.abbr, MAX(FLOOR(SUBSTR(trans_id, trans_id_length))) + 1 AS increment
      FROM general_ledger JOIN project ON general_ledger.project_id = project.id
      WHERE general_ledger.project_id = project_id)c
      GROUP BY abbr
  );
END $$

DELIMITER ;
