/*
  ---------------------------------------------------
  Import Account Procedure
  ---------------------------------------------------

  This procedure import a new account into the system
*/
DELIMITER $$

DROP PROCEDURE IF EXISTS ImportAccount;
CREATE PROCEDURE ImportAccount (
  IN enterpriseId SMALLINT(5),
  IN accountNumber INT(11),
  IN accountLabel VARCHAR(200),
  IN accountType VARCHAR(100),
  IN accountParent INT(11),
  IN importingOption TINYINT(1)
)
BEGIN
  DECLARE existAccount TINYINT(1);
  DECLARE existAccountType TINYINT(1);
  DECLARE existAccountParent TINYINT(1);
  DECLARE accountLength TINYINT(1);

  DECLARE accountParentId INT(11) DEFAULT 0;
  DECLARE defaultAccountParentId INT(11) DEFAULT 0;
  DECLARE accountTypeId MEDIUMINT(8);
  DECLARE IMPORT_DEFAULT_OHADA_ACCOUNT_OPTION TINYINT(1) DEFAULT 1;

  SET existAccount = (SELECT IF((SELECT COUNT(`number`) AS total FROM `account` WHERE `number` = accountNumber) > 0, 1, 0));
  SET existAccountType = (SELECT IF((SELECT COUNT(*) AS total FROM `account_type` WHERE `type` = accountType) > 0, 1, 0));
  SET accountTypeId = (SELECT id FROM `account_type` WHERE `type` = accountType LIMIT 1);
  SET existAccountParent = (SELECT IF((SELECT COUNT(*) AS total FROM `account` WHERE `number` = accountParent) > 0, 1, 0));

  SET accountLength = (SELECT CHAR_LENGTH(accountNumber));

  /*
    Handle parent account for importing ohada list of accounts
    We assume that ohada main accounts are already loaded into the system
  */
  IF (existAccountParent = 1) THEN
    SET accountParentId = (SELECT id FROM `account` WHERE `number` = accountParent);
  END IF;


  /*
    Create account if it doesn't exist

    if the account already exist skip because we are in a loop and
    we have to continue importing other accounts
  */
  IF (existAccount = 0 AND existAccountType = 1) THEN
    INSERT INTO `account` (`type_id`, `enterprise_id`, `number`, `label`, `parent`) VALUES (accountTypeId, enterpriseId, accountNumber, accountLabel, accountParentId);

    /*
      Insert default accounts for a quick usage

      insert an child account if the option is default ohada and we have an account with four digit
    */
    IF (accountLength = 4 AND importingOption = IMPORT_DEFAULT_OHADA_ACCOUNT_OPTION) THEN
      -- parent id
      SET defaultAccountParentId = (SELECT LAST_INSERT_ID());

      -- account type
      SET accountTypeId = PredictAccountTypeId(accountNumber);
      INSERT INTO `account` (`type_id`, `enterprise_id`, `number`, `label`, `parent`) VALUES (accountTypeId, enterpriseId, accountNumber * 10000, CONCAT('Compte ', accountLabel), defaultAccountParentId);
    END IF;

  END IF;
END $$

DELIMITER ;
