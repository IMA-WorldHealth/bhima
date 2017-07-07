/**
 * cashReport Controller
 *
 *
 * This controller is responsible for processing cash report.
 *
 * @module finance/cashReport
 *
 * @requires lodash
 * @requires lib/db
 * @requires lib/ReportManager
 * @requires lib/errors/BadRequest
 */

const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');
const BadRequest = require('../../../../lib/errors/BadRequest');

const TEMPLATE = './server/controllers/finance/reports/cashReport/report.handlebars';

// expose to the API
exports.report = report;
exports.document = document;

/**
 * @function report
 * @desc This function is responsible of generating the cash data for the report
 */
function report(req, res, next) {
  const params = req.query;

  /**
   * For allow the select of all transaction who are saved during the Date
   * Because the field trans_date is type DATETIME
   */
  params.dateTo += ' 23:59:59';
  params.reportType = parseInt(params.reportType, 10);

  const type = params.reportType;
  const typeMapping = {
    1 : processingCashEntryExitReport,
    2 : processingEntryReport,
    3 : processingExitReport,
  };

  if (!typeMapping[type]) {
    next(new BadRequest('The report type is missing and cannot work.'));
    return;
  }

  // call the report processing function
  let promise;
  try {
    promise = typeMapping[type](params);
  } catch (e) {
    next(e);
    return;
  }

  // once the report is rendered, return to sender
  promise
    .then(result => res.status(200).json(result))
    .catch(next);
}

/** processingCashEntryExitReport */
function processingCashEntryExitReport(params) {
  const glb = {};

  return getEntryReport(params.account_id, params.dateFrom, params.dateTo)
    .then((entries) => {
      glb.entries = entries;
      return getExitReport(params.account_id, params.dateFrom, params.dateTo);
    })
    .then((exits) => {
      glb.exits = exits;
      return glb;
    });
}


/** processingEntryReport */
function processingEntryReport(params) {
  const glb = {};

  // get entry report
  return getEntryReport(params.account_id, params.dateFrom, params.dateTo)
    .then((entries) => {
      glb.entries = entries;
      return glb;
    });
}

/** processingExitReport */
function processingExitReport(params) {
  const glb = {};

  // get entry report
  return getExitReport(params.account_id, params.dateFrom, params.dateTo)
    .then(exits => {
      glb.exits = exits;
      return glb;
    });
}

/**
 * @function getEntryReport
 * @param {account} account id of cashbox
 * @param {date} dateFrom A starting date
 * @param {date} dateTo A stop date
 */
function getEntryReport(accountId, dateFrom, dateTo) {
  const query = `
    SELECT 
      t.project_id, BUID(t.uuid) AS uuid, t.trans_date, t.debit_equiv, 
      t.credit_equiv, t.debit, t.credit, t.account_id, BUID(t.record_uuid) AS record_uuid,
      BUID(t.entity_uuid) AS entity_uuid,  BUID(t.reference_uuid) AS record_uuid, 
      t.currency_id, t.trans_id, t.description, t.comment, t.origin_id, 
      t.user_id, u.username, a.number, tr.text AS transactionType, 
      a.label
    FROM
    (
      (
      SELECT 
        posting_journal.project_id, posting_journal.uuid, posting_journal.trans_date, 
        posting_journal.debit_equiv, posting_journal.credit_equiv,
        posting_journal.debit, posting_journal.credit, posting_journal.account_id, 
        posting_journal.record_uuid, posting_journal.entity_uuid,  posting_journal.reference_uuid,
        posting_journal.currency_id, posting_journal.trans_id, posting_journal.description, 
        posting_journal.comment, posting_journal.origin_id, posting_journal.user_id
      FROM posting_journal
        WHERE posting_journal.account_id=? AND 
        (posting_journal.trans_date >=? AND posting_journal.trans_date <=?)
      ) UNION (
      SELECT 
        general_ledger.project_id, general_ledger.uuid, general_ledger.trans_date, 
        general_ledger.debit_equiv, general_ledger.credit_equiv,
        general_ledger.debit, general_ledger.credit, general_ledger.account_id, 
        general_ledger.record_uuid, general_ledger.entity_uuid, general_ledger.reference_uuid,
        general_ledger.currency_id, general_ledger.trans_id, general_ledger.description, 
        general_ledger.comment, general_ledger.origin_id, general_ledger.user_id
      FROM general_ledger
        WHERE general_ledger.account_id=? AND 
        (general_ledger.trans_date >=? AND general_ledger.trans_date <=?)
      )
    ) AS t
    JOIN user u ON t.user_id = u.id
    JOIN account a ON t.account_id = a.id
    LEFT JOIN transaction_type tr ON tr.id = t.origin_id
    WHERE t.debit > 0 GROUP BY t.trans_id;
  `;
  return db.exec(query, [accountId, dateFrom, dateTo, accountId, dateFrom, dateTo]);
}


/**
 * @function getExitReport
 * @param {account} account id of cashbox
 * @param {date} dateFrom A starting date
 * @param {date} dateTo A stop date
 */
function getExitReport(accountId, dateFrom, dateTo) {
  const query = `
    SELECT 
      t.project_id, BUID(t.uuid) AS uuid, t.trans_date, t.debit_equiv, 
      t.credit_equiv, t.debit, t.credit, t.account_id, BUID(t.record_uuid) AS record_uuid,
      BUID(t.entity_uuid) AS entity_uuid, BUID(t.reference_uuid) AS record_uuid, 
      t.currency_id, t.trans_id, t.description, t.comment, t.origin_id, 
      t.user_id, u.username, a.number, tr.text AS transactionType, 
      a.label
    FROM
    (
      (
      SELECT 
        posting_journal.project_id, posting_journal.uuid, posting_journal.trans_date, 
        posting_journal.debit_equiv, posting_journal.credit_equiv,
        posting_journal.debit, posting_journal.credit, posting_journal.account_id, 
        posting_journal.record_uuid, posting_journal.entity_uuid,  posting_journal.reference_uuid,
        posting_journal.currency_id, posting_journal.trans_id, posting_journal.description, 
        posting_journal.comment, posting_journal.origin_id, posting_journal.user_id
      FROM posting_journal
        WHERE posting_journal.account_id= ? AND 
        (posting_journal.trans_date >= ? AND posting_journal.trans_date <= ?)
      ) UNION (
      SELECT 
        general_ledger.project_id, general_ledger.uuid, general_ledger.trans_date, 
        general_ledger.debit_equiv, general_ledger.credit_equiv,
        general_ledger.debit, general_ledger.credit, general_ledger.account_id, 
        general_ledger.record_uuid, general_ledger.entity_uuid, 
        general_ledger.reference_uuid, general_ledger.currency_id, general_ledger.trans_id, 
        general_ledger.description, general_ledger.comment, general_ledger.origin_id, 
        general_ledger.user_id
      FROM general_ledger
        WHERE general_ledger.account_id= ? AND 
        (general_ledger.trans_date >= ? AND general_ledger.trans_date <= ?)
      )
    ) AS t
    JOIN user u ON t.user_id = u.id
    JOIN account a ON t.account_id = a.id
    LEFT JOIN transaction_type tr ON tr.id = t.origin_id
    WHERE t.credit > 0 GROUP BY t.trans_id;`;

  return db.exec(query, [accountId, dateFrom, dateTo, accountId, dateFrom, dateTo]);
}

function getRecordQuery (token){
  const query =
  `SELECT
    t.trans_date, t.debit_equiv, t.credit_equiv, t.description, 
		t.origin_id, t.user_id, u.username, a.number, 
		tr.text AS transactionType, a.label
  FROM
    (
      (
      SELECT
        p.trans_date, p.debit_equiv, p.credit_equiv,
        p.trans_id, p.description, p.origin_id, p.user_id, p.account_id
      FROM
        posting_journal AS p
      WHERE 
			p.account_id= ? AND (p.trans_date >= DATE(?) AND p.trans_date <= DATE(?))
      )
      UNION ALL
      (
      SELECT
        g.trans_date, g.debit_equiv, g.credit_equiv,
        g.trans_id, g.description, g.origin_id, g.user_id, g.account_id
      FROM
        general_ledger AS g
      WHERE 
			g.account_id= ? AND (g.trans_date >= DATE(?) AND g.trans_date <= DATE(?))
      )
    ) AS t
    JOIN 
	 	user u ON t.user_id = u.id
    JOIN 
	 	account a ON a.id = t.account_id
    LEFT JOIN 
	 	transaction_type tr ON tr.id = t.origin_id
    WHERE ${token} GROUP BY t.trans_id;`

  return query;
}

function aggregateRecordQuery (token = 1){
  const query =
  `
  SELECT
    ABS(SUM(t.debit - t.credit)) AS balance
  FROM
    (
      (
      SELECT
        p.debit_equiv AS debit, p.credit_equiv AS credit
      FROM
        posting_journal AS p
      WHERE 
        p.account_id= ? AND 
        (p.trans_date >= DATE(?) AND p.trans_date <= DATE(?))
      )
      UNION ALL
      (
      SELECT
        g.debit_equiv AS debit, g.credit_equiv AS credit
      FROM
        general_ledger AS g
      WHERE 
			  g.account_id= ? AND 
        (g.trans_date >= DATE(?) AND g.trans_date <= DATE(?))
      )
    ) AS t WHERE ${token};`

  return query;
}

function getCashRecord (accountId, dateFrom, dateTo){
  let reportContext = {};

  // Getting enries records
  return db.exec(getRecordQuery('t.debit_equiv > 0'), [accountId, dateFrom, dateTo, accountId, dateFrom, dateTo])
    .then((entries) => {
      reportContext.entries = entries;

      // Getting expenses records
      return db.exec(getRecordQuery('t.credit_equiv > 0'), [accountId, dateFrom, dateTo, accountId, dateFrom, dateTo]);
    })
    .then((expenses) => {
      reportContext.expenses = expenses;

      // Getting sum entries 
      return db.one(aggregateRecordQuery('t.debit > 0'), [accountId, dateFrom, dateTo, accountId, dateFrom, dateTo]);      
    })
    .then((totalEntry) => {
      reportContext.totalEntry = totalEntry.balance;

      // Getting sum expenses 
      return db.one(aggregateRecordQuery('t.credit > 0'), [accountId, dateFrom, dateTo, accountId, dateFrom, dateTo]);   
    })
    .then((totalExpense) => {
      reportContext.totalExpense = totalExpense.balance

      // Getting balance of cash account 
      return db.one(aggregateRecordQuery(), [accountId, dateFrom, dateTo, accountId, dateFrom, dateTo]);   
    })
    .then((finalTotal) => {
      reportContext.finalTotal = finalTotal.balance;
      return reportContext;
    });
}


/**
 * @function document
 * @description process and render the cash report document
 */
function document(req, res, next) {
  const params = req.query;
  console.log(params);
  let documentReport;

  if (!params.dateFrom || !params.dateTo) {
    throw new BadRequest('Date range should be specified', 'ERRORS.BAD_REQUEST');
  }

  if (!params.account_id) {
    throw new BadRequest('account of cash box not specified', 'ERRORS.BAD_REQUEST');
  }

  params.user = req.session.user;  
  let sumEntry = 0;
  let sumExit = 0;

  try {
    documentReport = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    next(e);
    return;
  }

  getCashRecord(params.account_id, params.dateFrom, params.dateTo)
    .then((reportContext) => {
<<<<<<< 5f207116aaa7ddd0f067b52b5ebd589233bb7c05
      reportContext.type_id = params.type;
      // console.log('reportContext', reportContext);
=======
      console.log('reportContext', reportContext);
>>>>>>> refactoring server side cash report
      return documentReport.render(reportContext);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();


  // processingCashEntryExitReport(params)
  //   .then(entryExit => {
  //     entryExit.reportEntry = false;
  //     entryExit.reportExit = false;
  //     entryExit.dateFrom = params.dateFrom;
  //     entryExit.dateTo = params.dateTo;

  //     // pick the cashbox account name
  //     if (!entryExit.accountName && entryExit.entries.length) {
  //       entryExit.accountName = entryExit.entries[0].label;
  //     } else if (!entryExit.accountName && entryExit.exits && entryExit.exits.length) {
  //       entryExit.accountName = entryExit.exits[0].label;
  //     } else {
  //       entryExit.accountName = entryExit.accountName;
  //     }

  //     // pick the cashbox account Number
  //     if (!entryExit.accountNumber && entryExit.entries.length) {
  //       entryExit.accountNumber = entryExit.entries[0].number;
  //     } else if (!entryExit.accountNumber && entryExit.exits && entryExit.exits.length) {
  //       entryExit.accountNumber = entryExit.exits[0].number;
  //     } else {
  //       entryExit.accountNumber = entryExit.accountNumber;
  //     }

  //     const reportType = parseInt(params.type, 10);

  //     if (reportType === 1 || reportType === 2) {
  //       entryExit.entries.forEach((entry) => {
  //         sumEntry += entry.debit;
  //       });

  //       entryExit.reportEntry = true;
  //       entryExit.sumEntry = sumEntry;
  //     }

  //     if (reportType === 1 || reportType === 3) {
  //       entryExit.exits.forEach((exit) => {
  //         sumExit += exit.credit;
  //       });

  //       entryExit.reportExit = true;
  //       entryExit.sumExit = sumExit;
  //     }

  //     return documentReport.render({ entryExit });
  //   })
  //   .then(result => {
  //     res.set(result.headers).send(result.report);
  //   })
  //   .catch(next)
  //   .done();
}
