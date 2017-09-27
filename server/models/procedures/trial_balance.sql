-- this writes transactions to a temporary table
CREATE PROCEDURE StageTrialBalanceTransaction(
  IN record_uuid BINARY(16)
)
BEGIN
  CREATE TEMPORARY TABLE IF NOT EXISTS stage_trial_balance_transaction (record_uuid BINARY(16));
  INSERT INTO stage_trial_balance_transaction SET stage_trial_balance_transaction.record_uuid = record_uuid;
END $$

/*
TrialBalanceErrors()

DESCRIPTION
This stored procedure validates records that are used in the Trial Balance before they are posted
to the General Ledger.  The records are run through a series of SQL queries to validate their
correctness.  The follow assertions are made:
 1. The transaction dates are within the identified period
 2. Every line has some sort of description (best practice)
 3. All affected periods are unlocked.
 4. All affected accounts are unlocked.
 5. All transactions are balanced.
 6. All transactions have at least two lines (required for double-entry accounting)

Please be sure to stage all transactions for use via the StageTrialBalanceTransaction()
call.

SAMPLE OUTPUT
Running this query will return NULL if no errors have occurred.  If errors exist in the transaction,
the following table will be emitted.
+--------------------------------------+----------+------------------------------------------------+
| record_uuid                          | trans_id | code                                           |
+--------------------------------------+----------+------------------------------------------------+
| 666bfbbe-48d4-435e-997b-238a48760a1a | HEV39508 | POSTING_JOURNAL.ERRORS.UNBALANCED_TRANSACTIONS |
+--------------------------------------+----------+------------------------------------------------+

USAGE: CALL TrialBalanceErrors()
*/
CREATE PROCEDURE TrialBalanceErrors()
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
    SELECT pj.record_uuid, pj.trans_id, 'POSTING_JOURNAL.ERRORS.SINGLE_LINE_TRANSACTION' AS code
    FROM posting_journal AS pj JOIN stage_trial_balance_transaction AS temp
      ON pj.record_uuid = temp.record_uuid
    GROUP BY pj.record_uuid
    HAVING COUNT(pj.record_uuid) < 2;

  SELECT DISTINCT BUID(record_uuid) AS record_uuid, trans_id, code FROM stage_trial_balance_errors ORDER BY code, trans_id;
END $$

/*
TrialBalanceSummary()

DESCRIPTION
This stored procedure produces the traditional Trial Balance table showing the account balances for any affected accounts
prior to the balance (`balance_before`), the debits to the accounts (`debit_equiv`), the credits to the accounts
(`credit_equiv`), and the proposed balances at the end of the operation (`balance_final`).  It should be used before
posting to the General Ledger to ensure that all transactions are correctly processed.

To use this method, a Trial Balance must first be _staged_.  The application expects that the record_uuids of all
transactions are already placed in the stage_trial_balance_transaction table via a call to
StageTrialBalanceTransaction().

SAMPLE OUTPUT
Running this a table with the following type:
+------------+--------+----------------------+----------------+-------------+--------------+----------------+
| account_id | number | label                | balance_before | debit_equiv | credit_equiv | balance_final  |
+------------+--------+----------------------+----------------+-------------+--------------+----------------+
|       3880 | 411900 | Patients Payant Cash | -22554880.0000 |  12250.0000 |   29100.0000 | -22571730.0000 |
|       3734 | 570001 | Petite Caisse (FC)   |   3331350.0000 |  29100.0000 |       0.0000 |   3360450.0000 |
|       3704 | 700100 | Pharmacie d’usage    |  -2516075.0000 |  17250.0000 |       0.0000 |  -2498825.0000 |
|       3886 | 700102 | Medicaments          | -23284054.9000 |      0.0000 |   29000.0000 | -23313054.9000 |
|       3887 | 700201 | Fiches               |   -497600.0000 |      0.0000 |     500.0000 |   -498100.0000 |
+------------+--------+----------------------+----------------+-------------+--------------+----------------+


USAGE: CALL TrialBalanceSummary()
*/
--
CREATE PROCEDURE TrialBalanceSummary()
BEGIN
  -- this assumes lines have been staged using CALL StageTrialBalanceTransaction()

  -- gather the staged accounts
  CREATE TEMPORARY TABLE IF NOT EXISTS staged_accounts AS
    SELECT DISTINCT account_id FROM posting_journal JOIN stage_trial_balance_transaction
    ON posting_journal.record_uuid = stage_trial_balance_transaction.record_uuid;

  -- gather the beginning period_totals
  CREATE TEMPORARY TABLE before_totals AS
    SELECT u.account_id, IFNULL(SUM(debit - credit), 0) AS balance_before
    FROM staged_accounts as u
    LEFT JOIN period_total ON u.account_id = period_total.account_id
    GROUP BY u.account_id;

  SELECT account_id, account.number AS number, account.label AS label,
    balance_before, debit_equiv, credit_equiv,
    balance_before + debit_equiv - credit_equiv AS balance_final
  FROM (
    SELECT posting_journal.account_id, totals.balance_before, SUM(debit_equiv) AS debit_equiv,
      SUM(credit_equiv) AS credit_equiv
    FROM posting_journal JOIN before_totals as totals
    ON posting_journal.account_id = totals.account_id
    WHERE posting_journal.record_uuid IN (
      SELECT record_uuid FROM stage_trial_balance_transaction
    ) GROUP BY posting_journal.account_id
  ) AS combined
  JOIN account ON account.id = combined.account_id
  ORDER BY account.number;
END $$
