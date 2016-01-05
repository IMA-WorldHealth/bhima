// scripts/controllerstrialbalance.js

/*
 * The trial balance provides a description of what the general
 * ledger and balance sheet would look like after posting
 * data from the posting journal to the general ledger.  It also
 * submit errors back to the client.
 *
 * We perform various checks on the data to ensure that all
 * values are correct and present.  These checks include:
 *  1) Every transaction has an account [FATAL]
 *  2) Every account used is unlocked [FATAL]
 *  3) Every transaction has an currency [FATAL]
 *  4) Every transaction has a 0 balance (debits - credits, debit_equv - credit_equiv) [FATAL]
 *  5) Every transaction has the same fiscal year and period [FATAL]
 *  6) The fiscal year and period for each transaction is not in the future [FATAL]
 *  7) A deb_cred_type exists for each transaction with a deb_cred_uuid [FATAL]
 *  8) An exchange rate exists for each row/date in the transaction [WARNING]
 *  9) A doc_num exists for transactions involving a debtor/creditor [WARNING]
 *
 * If an error or warning is incurred, the controller responds
 * to the client with a 200 'OK' status header, however, it includes
 * information about the potential errors.  Since errors can be fatal
 * or non-fatal, it is inappropriate to use a '400 Bad Request' status. The
 * body returned to the client is in the following format:
 * {
 *   balances :  [{
 *     account_id : '',
 *     account_number :'',
 *     balance : 0,        // can be null or number
 *     credit : 0,         // sum of credit_equv
 *     debit : 0           // sum of debit_equiv
 *   }, etc ...  ],
 *   exceptions : [{
 *     code : '',          // e.g 'ERR_MISSING_ACCOUNT'  warning prefix is WARN_
 *     fatal : false,      // boolean if fatal (blocking) or not
 *     transactions : ['HBB1'],   // affected transaction ids
 *     affectedRows : 12          // number of affectedRows in the transaction
 *   },
 *   metadata : {
 *     maxdate : "2015-05-13",    // the largest date being posted
 *     mindate : "2015-01-14"     // the minumum date being posted
 *     rows : 12,                 // number of rows being posted
 *     transactions : 1           // number of transactions being posted
 *   }]
 * }
 *
 * If there is no error, we send back the trial balance report,
 * telling the state of the general ledger before the post and
 * after.
 */

var q = require('q'),
    db = require('../../lib/db'),
    uuid = require('../../lib/guid'),
    util = require('../../lib/util');

// utility function to sum an array of objects
// on a particular property
function aggregate(property, array) {
  return array.reduce(function (s, row) {
    return s + row[property];
  }, 0);
}

// creates an error report for a given code
function createErrorReport(code, isFatal, rows) {
  return {
    code : code,
    fatal : isFatal,
    transactions : rows.map(function (row) { return row.trans_id; }),
    affectedRows : aggregate('count', rows)
  };
}


// Ensure no accounts are locked in the transactions
function checkAccountsLocked(transactions) {
  var sql =
    'SELECT COUNT(pj.uuid) AS count, pj.trans_id ' +
    'FROM posting_journal AS pj LEFT JOIN account ' +
      'ON pj.account_id = account.id ' +
    'WHERE account.locked = 1 AND pj.trans_id IN (?) ' +
    'GROUP BY pj.trans_id;';

  return db.exec(sql, [transactions])
  .then(function (rows) {

    // if nothing is returned, skip error report
    if (!rows.length) { return; }

    // returns a error report
    return createErrorReport('ERROR.ERR_LOCKED_ACCOUNTS', true, rows);
  });
}

// make sure there are no missing accounts in the transactions
function checkMissingAccounts(transactions) {
  var sql =
    'SELECT COUNT(pj.uuid), pj.trans_id ' +
    'FROM posting_journal AS pj LEFT JOIN account ON ' +
      'pj.account_id = account.id ' +
    'WHERE pj.trans_id IN (?) AND account.id IS NULL ' +
    'GROUP BY pj.trans_id';

  return db.exec(sql, [transactions])
  .then(function (rows) {

    // if nothing is returned, skip error report
    if (!rows.length) { return; }

    // returns a error report
    return createErrorReport('ERROR.ERROR_MISSING_ACCOUNTS', true, rows);
  });
}

// make sure dates are in their correct period
function checkDateInPeriod(transactions) {
  var sql =
    'SELECT COUNT(pj.uuid) AS count, pj.trans_id, pj.trans_date, p.period_start, p.period_stop ' +
    'FROM posting_journal AS pj JOIN period as p ON pj.period_id = p.id ' +
    'WHERE pj.trans_date NOT BETWEEN p.period_start AND p.period_stop AND ' +
      'pj.trans_id IN (?) ' +
    'GROUP BY pj.trans_id;';

  return db.exec(sql, [transactions])
  .then(function (rows) {
    // if nothing is returned, skip error report
    if (!rows.length) { return; }

    // returns a error report
    return createErrorReport('ERROR.ERR_DATE_IN_WRONG_PERIOD', true, rows);
  });
}

// make sure fiscal years and periods exist for all transactions
function checkPeriodAndFiscalYearExists(transactions) {
  var sql =
    'SELECT COUNT(pj.uuid) AS count, pj.trans_id ' +
    'FROM posting_journal AS pj ' +
    'WHERE pj.trans_id IN (?) AND (pj.period_id IS NULL OR pj.fiscal_year_id IS NULL) ' +
    'GROUP BY pj.trans_id;';

  return db.exec(sql, [transactions])
  .then(function (rows) {

    // if nothing is returned, skip error report
    if (!rows.length) { return; }

    // returns a error report
    return createErrorReport('ERROR.ERR_MISSING_FISCAL_OR_PERIOD', true, rows);
  });
}


// make sure the debit_equiv, credit_equiv are balanced
function checkTransactionsBalanced(transactions) {

  var sql =
    'SELECT COUNT(pj.uuid) AS count, pj.trans_id, SUM(pj.debit_equiv - pj.credit_equiv) AS balance ' +
    'FROM posting_journal AS pj ' +
    'WHERE pj.trans_id IN (?) ' +
    'GROUP BY trans_id HAVING balance <> 0;';

  return db.exec(sql, [transactions])
  .then(function (rows) {

    // if nothing is returned, skip error report
    if (rows.length === 0) { return; }

    // returns a error report
    return createErrorReport('ERROR.ERR_UNBALANCED_TRANSACTIONS', true, rows);
  });
}

// make sure that a deb_cred_uuid exists for each deb_cred_type
function checkDebtorCreditorExists(transactions) {

  var sql =
    'SELECT COUNT(pj.uuid) AS count, pj.trans_id, pj.deb_cred_uuid FROM posting_journal AS pj ' +
    'WHERE pj.trans_id IN (?) AND (pj.deb_cred_type = \'D\' OR pj.deb_cred_type = \'C\') ' +
    'GROUP BY trans_id HAVING deb_cred_uuid IS NULL;';

  return db.exec(sql, [transactions])
  .then(function (rows) {

    // if nothing is returned, skip error report
    if (!rows.length) { return; }

    // returns a error report
    return createErrorReport('ERROR.ERR_MISSING_DEBTOR_CREDITOR', true, rows);
  });
}

// issue a warning if a transaction involving a debtor/creditor does not use a doc_num
function checkDocumentNumberExists(transactions) {
  var sql =
    'SELECT COUNT(pj.uuid) AS count, pj.doc_num, pj.trans_id, pj.deb_cred_uuid FROM posting_journal AS pj ' +
    'WHERE pj.trans_id IN (?) AND (pj.deb_cred_type = \'D\' OR pj.deb_cred_type = \'C\') ' +
    'GROUP BY pj.trans_id HAVING pj.doc_num IS NULL;';

  return db.exec(sql, [transactions])
  .then(function (rows) {

    // if nothing is returned, skip error report
    if (!rows.length) { return; }

    // returns a error report
    return createErrorReport('ERROR.WARN_MISSING_DOCUMENT_ID', false, rows);
  });
}

// takes in an array of transactions and runs the trial
// balance checks on them,
function runAllChecks(transactions) {
  return q.all([
    checkAccountsLocked(transactions),
    checkMissingAccounts(transactions),
    checkDateInPeriod(transactions),
    checkPeriodAndFiscalYearExists(transactions),
    checkTransactionsBalanced(transactions),
    checkDebtorCreditorExists(transactions),
    checkDocumentNumberExists(transactions)
  ]);
}

/* POST /journal/trialbalance
 *
 * Performs the trial balance.
 *
 * Initially, the checks described at the beginning of the module are
 * performed to catch errors.  Even if errors or warnings are incurred,
 * the balance proceeds to report the total number of rows in the
 * trailbalance and other details.
 *
 * This report is sent back to the client for processing.
 *
 * NOTE: though a user may choose to ignore the errors presented
 * in the trial balance, the posting operation will block posting
 * to the general ledger if there are any 'fatal' errors.
*/
exports.postTrialBalance = function (req, res, next) {
  'use strict';

  // parse the query string and retrieve the params
  var transactions = req.body.transactions.map(function (t) { return t.toUpperCase(); }),
      report = {};

  // run the database checks
  runAllChecks(transactions)
  .then(function (results) {

    // filter out the checks that passed
    // (they will be null/undefined)
    report.exceptions = results.filter(function (r) {
      return !!r;
    });

    // attempt to calculate a summary of the before, credit, debit, and after
    // state of each account in the posting journal
    var sql =
      'SELECT pt.debit, pt.credit, '  +
      'pt.account_id, pt.balance, account.account_number ' +
      'FROM  account JOIN ( ' +
        'SELECT SUM(debit_equiv) AS debit, SUM(credit_equiv) AS credit, ' +
        'posting_journal.account_id, (period_total.debit - period_total.credit) AS balance ' +
        'FROM posting_journal LEFT JOIN period_total ' +
        'ON posting_journal.account_id = period_total.account_id ' +
        'WHERE posting_journal.trans_id IN (?) ' +
        'GROUP BY posting_journal.account_id' +
        ') AS pt ' +
      'ON account.id = pt.account_id;';

    return db.exec(sql, [transactions]);
  })
  .then(function (balances) {

    // attach the balances to the response
    report.balances = balances;

    // attempt to calculate the date range of the transactions
    var sql =
      'SELECT COUNT(trans_id) AS rows, COUNT(DISTINCT(trans_id)) AS transactions, ' +
        'MIN(DATE(trans_date)) AS mindate, MAX(DATE(trans_date)) AS maxdate ' +
      'FROM posting_journal WHERE trans_id IN (?);';

    return db.exec(sql, [transactions]);
  })
  .then(function (metadata) {

    // attach the dates to the response
    report.metadata = metadata[0];

    // trial balance succeeded!  Send back the resulting report
    res.status(200).send(report);
  })
  .catch(function (error) {
    console.error(error.stack);

    // whoops.  Still have either errors or warnings. Make sure
    // that they are properly reported to the client.
    res.status(500).send(error);
  });
};


// POST /journal/togeneralledger
// Posts data passing a valid trial balance to the general ledger
exports.postToGeneralLedger = function (req, res, next) {
  'use strict';

  var sql,
      transactions = req.body.transactions.map(function (t) { return t.toUpperCase(); });

  // First check.  The post must pass a valid trial balance.  If it does
  // not pass the trial balance, we error hard with a '400 Bad Request'
  // error.
  runAllChecks(transactions)
  .then(function (results) {

    // filter out the checks that passed
    // (they will be null/undefined)
    var exceptions = results.filter(function (r) {
      return !!r;
    });

    var hasErrors = exceptions.some(function (e) {
      return e.fatal === true;
    });

    // we cannot post if there are fatal exceptions. Throw
    // an error
    if (hasErrors) {
      throw { exceptions : exceptions };
    }

    // we assume from here on that trial balance checks have passed
    // let's open up a posting session
    sql =
      'INSERT INTO posting_session ' +
      'SELECT max(posting_session.id) + 1, ?, ? ' +
      'FROM posting_session;';

    return db.exec(sql, [req.session.user.id, new Date()]);
  })
  .then(function (result) {

    // recoup the sessionId from the posting session
    var sessionId = result.insertId;

    sql =
      'INSERT INTO general_ledger ' +
        '(project_id, uuid, fiscal_year_id, period_id, trans_id, trans_date, doc_num, ' +
        'description, account_id, debit, credit, debit_equiv, credit_equiv, ' +
        'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, comment, cost_ctrl_id, ' +
        'origin_id, user_id, cc_id, pc_id, session_id) ' +
      'SELECT project_id, uuid, fiscal_year_id, period_id, trans_id, trans_date, doc_num, ' +
        'description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id, ' +
        'deb_cred_uuid, deb_cred_type,inv_po_id, comment, cost_ctrl_id, origin_id, user_id, cc_id, pc_id, ? ' +
      'FROM posting_journal WHERE trans_id IN (?);';
    return db.exec(sql, [sessionId, transactions]);
  })
  .then(function () {

    // Sum all transactions for a given period from the PJ
    // into period_total, updating old values if necessary.
    sql =
      'INSERT INTO period_total (account_id, credit, debit, fiscal_year_id, enterprise_id, period_id) ' +
      'SELECT account_id, SUM(credit_equiv) AS credit, SUM(debit_equiv) as debit , fiscal_year_id, project.enterprise_id, ' +
        'period_id FROM posting_journal JOIN project ON posting_journal.project_id = project.id ' +
        'WHERE trans_id IN (?) ' +
      'GROUP BY period_id, account_id ' +
      'ON DUPLICATE KEY UPDATE credit = credit + VALUES(credit), debit = debit + VALUES(debit);';

    return db.exec(sql, [transactions]);
  })
  .then(function () {

    // Finally, we can remove the data from the posting journal
    sql = 'DELETE FROM posting_journal WHERE trans_id IN (?);';
    return db.exec(sql, [transactions]);
  })
  .then(function () {
    res.status(200).send();
  })
  .catch(function (error) {
    console.error('error', error.stack);

    // this was a generated error for failing the trial balance
    // tell the client that
    if (error.exceptions) {
      return res.status(400).send({ exceptions: error.exceptions });
    }

    // whoops.  Still have either errors or warnings. Make sure
    // that they are properly reported to the client.
    res.status(500).send(error);
  });
};
