/**
 * The trial balance provides a description of what the general
 * ledger would look like after posting data from the
 * posting journal to the general ledger.
 * It also submit errors back to the client.
 */
const db = require('../../../lib/db');
const BadRequest = require('../../../lib/errors/BadRequest');

exports.getDataPerAccount = function getDataPerAccount(req, res, next) {
  const transactions = req.body.transactions;

  if (!transactions) {
    next(new BadRequest('The transaction list is null or undefined'));
    return;
  }

  // This is a complicated query, but it performs correctly.
  //   1) The beginning balances are gathered for the accounts hit in the posting_journal
  //     by querying the period_totals table.  If they have never been used, defaults 0.  This
  //     is stored in the variable balance_before.
  //   2) The debits and credits of the posting journal are summed for the transactions hit.
  //     These are grouped by account and joined with the balance_before totals.
  //   3) To add clarity, a wrapper SELECT is used to show the balance_before, movements, and then
  //     balance_final as the sum of all of the above.  It also brings in the account_number
  const sql = `
    SELECT account_id, account.number AS number, account.label AS label,
      balance_before, debit_equiv, credit_equiv,
      balance_before + debit_equiv - credit_equiv AS balance_final
    FROM (
      SELECT posting_journal.account_id, totals.balance_before, SUM(debit_equiv) AS debit_equiv,
        SUM(credit_equiv) AS credit_equiv
      FROM posting_journal JOIN (
        SELECT u.account_id, IFNULL(SUM(debit - credit), 0) AS balance_before
        FROM (
          SELECT DISTINCT account_id FROM posting_journal WHERE posting_journal.trans_id IN (?)
        ) AS u
        LEFT JOIN period_total ON u.account_id = period_total.account_id
        GROUP BY u.account_id
      ) totals ON posting_journal.account_id = totals.account_id
      WHERE posting_journal.trans_id IN (?)
      GROUP BY posting_journal.account_id
    ) AS combined
      JOIN account ON account.id = combined.account_id
      ORDER BY account.number;
  `;

  // execute the query
  db.exec(sql, [transactions, transactions])
    .then(data => res.status(200).json(data))
    .catch(next);
};

/**
 * @function checkTransactions
 * @descriptions
 * fires all check functions and return back an array of promisses containing the errors
 * here are the list of checks [type of error]:
 *
 * 1. A transaction should have at least one line [FATAL]
 * 2. A transaction must be balanced [FATAL]
 * 3. A transaction must contain unlocked account only [FATAL]
 * 4. A transaction must not miss a account [FATAL]
 * 5. A transaction must not miss a period or a fiscal year [FATAL]
 * 6. A transaction must have every date valid  [FATAL]
 * 7. A transaction must have a ID for every line [FATAL]
 * 8. A transaction must have an ID of an entity for every line which have a no null entity type [FATAL]
 * 9. A transaction should have an entity ID if not a warning must be printed, but it is not critical [WARNING]
 *
 *
 * Here is the format of error and warnings :
 *
 * exceptions : [{
 *     code : '',          // e.g 'MISSING_ACCOUNT'
 *     fatal : false,      // true for error (will block posting) and false for warning (will not block posting)
 *     transactions : ['HBB1'],   // affected transaction ids list
 *     affectedRows : 12          // number of affectedRows in the transaction
 *   }]
 * */
exports.checkTransactions = function runTrialBalance(req, res, next) {
  const transactions = req.body.transactions;

  if (!transactions) {
    return next(new BadRequest('The transaction list is null or undefined'));
  }

  if (!Array.isArray(transactions)) {
    return next(new BadRequest('The query is bad formatted'));
  }

  const txn = db.transaction();

  transactions.forEach((transaction) => {
    txn.addQuery('CALL StageTrialBalanceTransaction(?);', transaction);
  });

  txn.addQuery('CALL TrialBalance()');

  return txn.execute()
    .then((errors) => {
      const lastIndex = errors.length - 1;
      res.status(201).json(errors[lastIndex][0]);
    })
    .catch(next);
};

/**
 * @function postToGeneralLedger
 * @description
 * This function can be called only when there is no fatal error
 * It posts data to the general ledger.
 * */
exports.postToGeneralLedger = function postToGeneralLedger(req, res, next) {
  const transactions = req.body.transactions;

  if (!transactions || !Array.isArray(transactions)) {
    return next(new BadRequest('The transaction list is null or undefined otherwise The query is bad formatted'));
  }

  // Just a workaround because mysql does not have a type for array
  const transactionString = transactions.map(transId => `"${transId}"`).join(',');

  return db.exec('CALL PostToGeneralLedger(?)', [transactionString])
    .then(() => res.status(201).json({}))
    .catch(next);
};
