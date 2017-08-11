/**
 * @overview trialbalance
 *
 * @description
 * This module contains the HTTP wrappers for the Trial Balance.  Most of the SQL
 * has been migrated to stored procedures in MySQL with lengthy descriptions of each
 * in comments above the respective methods.
 *
 * @requires db
 * @requires BadRequest
 */

const db = require('../../../lib/db');
const BadRequest = require('../../../lib/errors/BadRequest');

// wrapper to reuse staging code
// txn is a db.transaction()
function stageTrialBalanceTransactions(txn, transactions) {
  transactions.forEach((transaction) => {
    txn.addQuery('CALL StageTrialBalanceTransaction(?);', db.bid(transaction));
  });
}

exports.runTrialBalance = function runTrialBalance(req, res, next) {
  const transactions = req.body.transactions;
  const hasInvalidTransactions = !(transactions && Array.isArray(transactions) && transactions.length);

  if (hasInvalidTransactions) {
    return next(new BadRequest(
      'No transactions were submitted.  Please ensure that some are selected.',
      'POSTING_JOURNAL.ERRORS.MISSING_TRANSACTIONS'
    ));
  }

  const txn = db.transaction();

  // stage all trial balance transactions
  stageTrialBalanceTransactions(txn, transactions);

  // compute any trial balance errors
  txn.addQuery('CALL TrialBalanceErrors()');

  // compute the trial balance summary
  txn.addQuery('CALL TrialBalanceSummary()');

  // compute the aggregate results for the trial balance
  // txn.addQuery('CALL TrialBalanceAggregates()');

  return txn.execute()
    .then((results) => {
      // because we do not know the number of stageTrialBalance() calls, we must index back by two
      // to get to the CALL TrialBalanceErrors() query and one for the Call TrialBalanceSummary()
      // query.
      const errorsIndex = results.length - 2;
      const summaryIndex = results.length - 1;

      const data = {
        errors : results[errorsIndex][0],
        summary : results[summaryIndex][0],
      };

      res.status(201).json(data);
    })
    .catch(next);
};

/**
 * @function postToGeneralLedger
 * @description
 * This function can be called only when there is no fatal error
 * It posts data to the general ledger.
 */
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
