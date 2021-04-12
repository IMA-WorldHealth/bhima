DELIMITER $$
/*
 Create Fiscal Year and Periods

This procedure help to create fiscal year and fiscal year's periods
periods include period `0` and period `13`
*/

DROP PROCEDURE IF EXISTS CreateFiscalYear$$
CREATE PROCEDURE CreateFiscalYear(
  IN p_enterprise_id SMALLINT(5),
  IN p_previous_fiscal_year_id MEDIUMINT(8),
  IN p_user_id SMALLINT(5),
  IN p_label VARCHAR(50),
  IN p_number_of_months MEDIUMINT(8),
  IN p_start_date DATE,
  IN p_end_date DATE,
  IN p_note TEXT,
  OUT fiscalYearId MEDIUMINT(8)
)
BEGIN
  INSERT INTO fiscal_year (
    `enterprise_id`, `previous_fiscal_year_id`, `user_id`, `label`,
    `number_of_months`, `start_date`, `end_date`, `note`
  ) VALUES (
    p_enterprise_id, p_previous_fiscal_year_id, p_user_id, p_label,
    p_number_of_months, p_start_date, p_end_date, p_note
  );

  SET fiscalYearId = LAST_INSERT_ID();
  CALL CreatePeriods(fiscalYearId);
END $$

DROP PROCEDURE IF EXISTS GetPeriodRange$$
CREATE PROCEDURE GetPeriodRange(
  IN fiscalYearStartDate DATE,
  IN periodNumberIndex SMALLINT(5),
  OUT periodStartDate DATE,
  OUT periodEndDate DATE
) BEGIN
  DECLARE `innerDate` DATE;

  SET innerDate = (SELECT DATE_ADD(fiscalYearStartDate, INTERVAL periodNumberIndex-1 MONTH));
  SET periodStartDate = (SELECT CAST(DATE_FORMAT(innerDate ,'%Y-%m-01') as DATE));
  SET periodEndDate = (SELECT LAST_DAY(innerDate));
END $$

DROP PROCEDURE IF EXISTS CreatePeriods$$
CREATE PROCEDURE CreatePeriods(
  IN fiscalYearId MEDIUMINT(8)
)
BEGIN
  DECLARE periodId MEDIUMINT(8);
  DECLARE periodNumber SMALLINT(5) DEFAULT 0;
  DECLARE periodStartDate DATE;
  DECLARE periodEndDate DATE;
  DECLARE periodLocked TINYINT(1);

  DECLARE fyEnterpriseId SMALLINT(5);
  DECLARE fyNumberOfMonths MEDIUMINT(8) DEFAULT 0;
  DECLARE fyLabel VARCHAR(50);
  DECLARE fyStartDate DATE;
  DECLARE fyEndDate DATE;
  DECLARE fyPreviousFYId SMALLINT(5);
  DECLARE fyLocked TINYINT(1);
  DECLARE fyCreatedAt TIMESTAMP;
  DECLARE fyUpdatedAt TIMESTAMP;
  DECLARE fyUserId MEDIUMINT(5);
  DECLARE fyNote TEXT;

  -- get the fiscal year informations
  SELECT
    enterprise_id, number_of_months, label, start_date, end_date,
    previous_fiscal_year_id, locked, created_at, updated_at, user_id, note
    INTO
    fyEnterpriseId, fyNumberOfMonths, fyLabel, fyStartDate, fyEndDate,
    fyPreviousFYId, fyLocked, fyCreatedAt, fyUpdatedAt, fyUserId, fyNote
  FROM fiscal_year WHERE id = fiscalYearId;

  -- insert N+1 period
  WHILE periodNumber <= fyNumberOfMonths + 1 DO

    IF periodNumber = 0 THEN
      -- Extremum periods 0 and N+1
      -- Insert periods with null dates - period id is YYYY00
      INSERT INTO period (`id`, `fiscal_year_id`, `number`, `start_date`, `end_date`, `locked`)
      VALUES (CONCAT(YEAR(fyStartDate), periodNumber), fiscalYearId, periodNumber, NULL, NULL, 0);

    ELSEIF periodNumber = fyNumberOfMonths + 1 THEN
      -- Extremum periods N+1
      -- Insert periods with null dates - period id is YYYY13
      INSERT INTO period (`id`, `fiscal_year_id`, `number`, `start_date`, `end_date`, `locked`)
      VALUES (CONCAT(YEAR(fyStartDate), periodNumber), fiscalYearId, periodNumber, NULL, NULL, 0);

    ELSE
      -- Normal periods
      -- Get period dates range
      CALL GetPeriodRange(fyStartDate, periodNumber, periodStartDate, periodEndDate);

      -- Inserting periods -- period id is YYYYMM
      INSERT INTO period(`id`, `fiscal_year_id`, `number`, `start_date`, `end_date`, `locked`)
      VALUES (DATE_FORMAT(periodStartDate, '%Y%m'), fiscalYearId, periodNumber, periodStartDate, periodEndDate, 0);
    END IF;

    SET periodNumber = periodNumber + 1;

    CALL UpdatePeriodLabels();
  END WHILE;
END $$



DROP PROCEDURE IF EXISTS `UpdatePeriodLabels`$$
CREATE PROCEDURE `UpdatePeriodLabels`()
BEGIN
DECLARE _id mediumint(8) unsigned;
DECLARE _start_date DATE;

DECLARE done BOOLEAN;
DECLARE curs1 CURSOR FOR
   SELECT id, start_date FROM period;

DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

OPEN curs1;
    read_loop: LOOP
    FETCH curs1 INTO _id, _start_date;
        IF done THEN
            LEAVE read_loop;
        END IF;
         UPDATE period SET
			  period.translate_key = CONCAT('TABLE.COLUMNS.DATE_MONTH.', UPPER(DATE_FORMAT(_start_date, "%M"))),
			  period.year =  YEAR(_start_date)
			WHERE period.id = _id;
    END LOOP;
CLOSE curs1;
END$$

/*
CALL CloseFiscalYear();

DESCRIPTION
This procedure closes a fiscal year in the follow way:
 1. Look up the next fiscal year.  You can only close a fiscal year if you
have a subsequent fiscal year created.
 2. Retrieve the balances for every account by summing the period_totals.
 3. Find the balance of income and expense accounts by summing both groups and
subtracting the total income from the total expense.
 4. Write the balances of every account that isn't an income or expense account
to the period 0 of the subsequent year.
 5. Write the balance of income and expense accounts (step 3) to the period 0
value of the account provided. If this account had a previous value, add the two
to get the final opening balance.

TODO - check that there are no unposted records from previous years.
*/
DROP PROCEDURE IF EXISTS CloseFiscalYear$$
CREATE PROCEDURE CloseFiscalYear(
  IN fiscalYearId MEDIUMINT UNSIGNED,
  IN closingAccountId INT UNSIGNED
)
BEGIN
  DECLARE NoSubsequentFiscalYear CONDITION FOR SQLSTATE '45010';
  DECLARE nextFiscalYearId MEDIUMINT UNSIGNED;
  DECLARE nextPeriodZeroId MEDIUMINT UNSIGNED;
  DECLARE currentFiscalYearClosingPeriod INT;

  DECLARE incomeAccountType SMALLINT;
  DECLARE expenseAccountType SMALLINT;

  -- constants
  SET incomeAccountType = 4;
  SET expenseAccountType = 5;

  -- find the subsequent fiscal year
  SET nextFiscalYearId = (
    SELECT id FROM fiscal_year
    WHERE previous_fiscal_year_id = fiscalYearId
    LIMIT 1
  );

  -- get the current fiscal year date
  SET currentFiscalYearClosingPeriod = (
    SELECT period.id FROM period WHERE period.fiscal_year_id = fiscalYearId ORDER BY period.number DESC LIMIT 1
  );

  IF nextFiscalYearId IS NULL THEN
    SIGNAL NoSubsequentFiscalYear
    SET MESSAGE_TEXT =
      'A fiscal year can only be closed into a subsequent fiscal year.  There is no following year for this fiscal year.';
  END IF;

  -- find the period id of the period 0 for the subsequent fiscal year
  SET nextPeriodZeroId = (
    SELECT period.id FROM period
    WHERE period.fiscal_year_id = nextFiscalYearId AND period.number = 0
  );

  -- create the fiscal year balances
  CREATE TEMPORARY TABLE FiscalYearBalances AS
    SELECT a.id, MAX(fy.id) AS fiscal_year_id, MAX(fy.enterprise_id) AS enterprise_id,
      SUM(pt.credit) AS credit, SUM(pt.debit) AS debit,
      SUM(pt.debit - pt.credit) AS balance, MAX(a.type_id) AS type_id
    FROM period_total AS pt
      JOIN account AS a ON pt.account_id = a.id
      JOIN account_type AS at ON a.type_id = at.id
      JOIN fiscal_year AS fy ON pt.fiscal_year_id = fy.id
    WHERE pt.fiscal_year_id = fiscalYearId
    GROUP BY a.id
    ORDER BY a.number;

  -- reverse the income/expense accounts in closing period into the closing account
  -- If they have a debit balance, credit them the difference, if they have a
  -- credit balance, debit them the difference
  INSERT INTO period_total
    (enterprise_id, fiscal_year_id, period_id, account_id, credit, debit)
  SELECT fyb.enterprise_id, fyb.fiscal_year_id, currentFiscalYearClosingPeriod, fyb.id,
    IF(fyb.debit > fyb.credit, fyb.debit - fyb.credit, 0),
    IF(fyb.debit < fyb.credit, fyb.credit - fyb.debit, 0)
  FROM FiscalYearBalances AS fyb
  WHERE fyb.type_id IN (incomeAccountType, expenseAccountType);

  -- sum all income/expense accounts from the fiscal year into the closing
  -- account in the closing period
  INSERT INTO period_total
    (enterprise_id, fiscal_year_id, period_id, account_id, credit, debit)
  SELECT fyb.enterprise_id, fyb.fiscal_year_id, currentFiscalYearClosingPeriod,
    closingAccountId, SUM(fyb.credit) credit, SUM(fyb.debit) debit
  FROM FiscalYearBalances AS fyb
  WHERE fyb.type_id IN (incomeAccountType, expenseAccountType)
  GROUP BY fyb.enterprise_id
  ON DUPLICATE KEY UPDATE credit = credit + VALUES(credit), debit = debit + VALUES(debit);

  -- copy all balances of non-income and non-expense accounts as the opening
  -- balance of the next fiscal year.  Leaving off the closing account, since it
  -- will be migrated from the closing period.
  INSERT INTO period_total
    (enterprise_id, fiscal_year_id, period_id, account_id, credit, debit)
  SELECT fyb.enterprise_id, nextFiscalYearId, nextPeriodZeroId, fyb.id,
    fyb.credit, fyb.debit
  FROM FiscalYearBalances AS fyb
  WHERE fyb.type_id NOT IN (incomeAccountType, expenseAccountType)
    AND fyb.id <> closingAccountId;

  -- now bring over the closing account from the closing period
  INSERT INTO period_total
    (enterprise_id, fiscal_year_id, period_id, account_id, credit, debit)
  SELECT enterprise_id, nextFiscalYearId, nextPeriodZeroId, account_id, credit, debit
  FROM period_total
  WHERE period_id = currentFiscalYearClosingPeriod
    AND account_id = closingAccountId;

  -- lock the fiscal year and associated periods
  UPDATE fiscal_year SET locked = 1 WHERE id = fiscalYearId;
  UPDATE period SET locked = 1 WHERE fiscal_year_id = fiscalYearId;
END $$

DELIMITER ;
