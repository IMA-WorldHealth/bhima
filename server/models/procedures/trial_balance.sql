-- this writes transactions to a temporary table
CREATE PROCEDURE StageTrialBalanceTransaction(
  IN trans_id TEXT
)
BEGIN
  CREATE TEMPORARY TABLE IF NOT EXISTS stage_trial_balance_transaction (record_uuid BINARY(16));

  INSERT INTO stage_trial_balance_transaction
    SELECT record_uuid FROM posting_journal WHERE posting_journal.trans_id = trans_id COLLATE utf8_general_ci;
END $$

-- run the Trial Balance
CREATE PROCEDURE TrialBalance()
BEGIN

  -- this will hold our error cases
  CREATE TEMPORARY TABLE IF NOT EXISTS stage_trial_balance_errors (record_uuid BINARY(16), trans_id TEXT, code TEXT);

  -- check if dates are in the correct period
  INSERT INTO stage_trial_balance_errors
    SELECT pj.record_uuid, pj.trans_id, 'POSTING_JOURNAL.ERRORS.DATE_IN_WRONG_PERIOD' AS code
    FROM posting_journal AS pj
      JOIN stage_trial_balance_transaction AS temp ON pj.record_uuid = temp.record_uuid
      JOIN period AS p ON pj.period_id = p.id
    WHERE DATE(pj.trans_date) NOT BETWEEN DATE(p.start_date) AND DATE(p.end_date)
    GROUP BY pj.record_uuid;

  -- check to make sure that all lines of a transaction have a description
  INSERT INTO stage_trial_balance_errors
    SELECT pj.record_uuid, pj.trans_id, 'POSTING_JOURNAL.ERRORS.MISSING_DESCRIPTION' AS code
    FROM posting_journal AS pj JOIN stage_trial_balance_transaction AS temp
      ON pj.record_uuid = temp.record_uuid
    WHERE pj.description IS NULL
    GROUP BY pj.record_uuid;

  -- check that all dates are in the correct period_ids
  INSERT INTO stage_trial_balance_errors
    SELECT pj.record_uuid, pj.trans_id, 'POSTING_JOURNAL.ERRORS.DATE_IN_WRONG_PERIOD' AS code
    FROM posting_journal AS pj JOIN stage_trial_balance_transaction AS temp
      ON pj.record_uuid = temp.record_uuid
    JOIN period p ON pj.period_id = p.id
    WHERE DATE(pj.trans_date) NOT BETWEEN DATE(p.start_date) AND DATE(p.end_date)
    GROUP BY pj.record_uuid;

  -- check that all periods are unlocked
  INSERT INTO stage_trial_balance_errors
    SELECT pj.record_uuid, pj.trans_id, 'POSTING_JOURNAL.ERRORS.LOCKED_PERIOD' AS code
    FROM posting_journal AS pj JOIN stage_trial_balance_transaction AS temp
      ON pj.record_uuid = temp.record_uuid
    JOIN period p ON pj.period_id = p.id
    WHERE p.locked = 1 GROUP BY pj.record_uuid;

  -- check that all accounts are unlocked
  INSERT INTO stage_trial_balance_errors
    SELECT pj.record_uuid, pj.trans_id, 'POSTING_JOURNAL.ERRORS.LOCKED_ACCOUNT' AS code
    FROM posting_journal AS pj JOIN stage_trial_balance_transaction AS temp
      ON pj.record_uuid = temp.record_uuid
    JOIN account a ON pj.account_id = a.id
    WHERE a.locked = 1 GROUP BY pj.record_uuid;

  -- check that all transactions are balanced
  INSERT INTO stage_trial_balance_errors
    SELECT pj.record_uuid, pj.trans_id, 'POSTING_JOURNAL.ERRORS.UNBALANCED_TRANSACTIONS' AS code
    FROM posting_journal AS pj JOIN stage_trial_balance_transaction AS temp
      ON pj.record_uuid = temp.record_uuid
    GROUP BY pj.record_uuid
    HAVING SUM(pj.debit_equiv) <> SUM(pj.credit_equiv);

  -- check that all transactions have two or more lines
  INSERT INTO stage_trial_balance_errors
    SELECT pj.record_uuid, pj.trans_id, 'POSTING_JOURNAL.ERRORS.SINGLE_LINE_TRANSATION' AS code
    FROM posting_journal AS pj JOIN stage_trial_balance_transaction AS temp
      ON pj.record_uuid = temp.record_uuid
    GROUP BY pj.record_uuid
    HAVING COUNT(pj.record_uuid) < 2;

  SELECT DISTINCT BUID(record_uuid) AS record_uuid, trans_id, code FROM stage_trial_balance_errors ORDER BY code, trans_id;
END $$
