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

  DECLARE accountParentId INT(11) DEFAULT 0;
  DECLARE accountTypeId MEDIUMINT(8);
  DECLARE IMPORT_OHADA_ACCOUNT_OPTION TINYINT(1) DEFAULT 2;

  SET existAccount = (SELECT IF((SELECT COUNT(`number`) AS total FROM `account` WHERE `number` = accountNumber AND `label` = accountLabel COLLATE utf8_unicode_ci) > 0, 1, 0));
  SET existAccountType = (SELECT IF((SELECT COUNT(*) AS total FROM `account_type` WHERE `type` = accountType COLLATE utf8_unicode_ci) > 0, 1, 0));
  SET accountTypeId = (SELECT id FROM `account_type` WHERE `type` = accountType COLLATE utf8_unicode_ci LIMIT 1);
  SET existAccountParent = (SELECT IF((SELECT COUNT(*) AS total FROM `account` WHERE `number` = accountParent COLLATE utf8_unicode_ci) > 0, 1, 0));

  /* 
    Handle parent account for importing ohada list of accounts
    We assume that ohada main accounts are already loaded into the system
  */
  IF (existAccountParent = 1) THEN
    SET accountParentId = (SELECT id FROM `account` WHERE `number` = accountParent COLLATE utf8_unicode_ci);
  END IF;
  

  /* 
    Create account if it doesn't exist 

    if the account already exist skip because we are in a loop and
    we have to continue importing other accounts
  */
  IF (existAccount = 0 AND existAccountType = 1) THEN
    INSERT INTO `account` (`type_id`, `enterprise_id`, `number`, `label`, `parent`) VALUES (accountTypeId, enterpriseId, accountNumber, accountLabel, accountParentId);
  END IF;
END $$

DELIMITER ;
