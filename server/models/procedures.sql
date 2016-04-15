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
  DECLARE NoEnterprise CONDITION FOR SQLSTATE '45000';
  DECLARE NoProject CONDITION FOR SQLSTATE '45000';
  DECLARE NoFiscalYear CONDITION FOR SQLSTATE '45000';
  DECLARE NoPeriod CONDITION FOR SQLSTATE '45000';
  DECLARE NoExchangeRate CONDITION FOR SQLSTATE '45000';

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

DELIMITER ;
