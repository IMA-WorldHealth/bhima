/*
 Create Fiscal Year and Periods

 This procedure help to create fiscal year and fiscal year's periods
 periods include period `0` and period `13`
*/

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

CREATE PROCEDURE GetPeriodRange(
  IN fiscalYearStartDate DATE,
  IN periodNumberIndex SMALLINT(5),
  OUT periodStartDate DATE,
  OUT periodEndDate DATE
)
BEGIN
  DECLARE `innerDate` DATE;

  SET innerDate = (SELECT DATE_ADD(fiscalYearStartDate, INTERVAL periodNumberIndex-1 MONTH));
  SET periodStartDate = (SELECT CAST(DATE_FORMAT(innerDate ,'%Y-%m-01') as DATE));
  SET periodEndDate = (SELECT LAST_DAY(innerDate));
END $$

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

  -- insert N+2 period
  WHILE periodNumber <= fyNumberOfMonths + 1 DO

    IF periodNumber = 0 OR periodNumber = fyNumberOfMonths + 1 THEN
      -- Extremum periods 0 and N+1
      -- Insert periods with null dates - period id is YYYY00
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
  END WHILE;
END $$
