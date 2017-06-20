/**
 * IncomeExpense Controller
 *
 *
 * This controller is responsible for processing incomeExpense report.
 *
 * @module finance/incomeExpense
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

const TEMPLATE = './server/controllers/finance/reports/incomeExpense/report.handlebars';

// expose to the API
// exports.report = report;
exports.document = document;

// /**
//  * @function report
//  * @desc This function is responsible of generating the incomeExpense data for the report
//  */
// function report(req, res, next) {
//   const params = req.query;

//   /**
//    * For allow the select of all transaction who are saved during the Date
//    * Because the field trans_date is type DATETIME
//    */
//   params.dateTo += ' 23:59:59';
//   params.reportType = parseInt(params.reportType, 10);

//   const type = params.reportType;
//   const typeMapping = {
//     1 : processingIncomeExpenseReport,
//     2 : processingIncomeReport,
//     3 : processingExpenseReport,
//   };

//   if (!typeMapping[type]) {
//     next(new BadRequest('The report type is missing and cannot work.'));
//     return;
//   }

//   // call the report processing function
//   let promise;
//   try {
//     promise = typeMapping[type](params);
//   } catch (e) {
//     next(e);
//     return;
//   }

//   // once the report is rendered, return to sender
//   promise
//     .then(result => res.status(200).json(result))
//     .catch(next);
// }

// /** processingIncomeExpenseReport */
// function processingIncomeExpenseReport(params) {
//   const glb = {};

//   if (!params.account_id) {
//     throw new BadRequest('Cashbox is missing.');
//   }

//   return getIncomeReport(params.account_id, params.dateFrom, params.dateTo)
//     .then((incomes) => {
//       glb.incomes = incomes;
//       return getExpenseReport(params.account_id, params.dateFrom, params.dateTo);
//     })
//     .then((expenses) => {
//       glb.expenses = expenses;
//       return glb;
//     });
// }


// /** processingIncomeReport */
// function processingIncomeReport(params) {
//   const glb = {};

//   if (!params.account_id) {
//     throw new BadRequest('The cashbox account ID is required.');
//   }

//   // get income report
//   return getIncomeReport(params.account_id, params.dateFrom, params.dateTo)
//     .then((incomes) => {
//       glb.incomes = incomes;
//       return glb;
//     });
// }

// /** processingExpenseReport */
// function processingExpenseReport(params) {
//   const glb = {};

//   if (!params.account_id) {
//     throw new BadRequest('The cashbox account id is required.');
//   }

//   // get income report
//   return getExpenseReport(params.account_id, params.dateFrom, params.dateTo)
//     .then(expenses => {
//       glb.expenses = expenses;
//       return glb;
//     });
// }

// /**
//  * @function getIncomeReport
//  * @param {account} account id of cashbox
//  * @param {date} dateFrom A starting date
//  * @param {date} dateTo A stop date
//  */
// function getIncomeReport(accountId, dateFrom, dateTo) {
//   const query = `
//     SELECT 
//       t.project_id, BUID(t.uuid) AS uuid, t.trans_date, t.debit_equiv, 
//       t.credit_equiv, t.debit, t.credit, t.account_id, BUID(t.record_uuid) AS record_uuid,
//       BUID(t.entity_uuid) AS entity_uuid,  BUID(t.reference_uuid) AS record_uuid, 
//       t.currency_id, t.trans_id, t.description, t.comment, t.origin_id, 
//       t.user_id, u.username, a.number, tr.text AS transactionType, 
//       a.label
//     FROM
//     (
//       (
//       SELECT 
//         posting_journal.project_id, posting_journal.uuid, posting_journal.trans_date, 
//         posting_journal.debit_equiv, posting_journal.credit_equiv,
//         posting_journal.debit, posting_journal.credit, posting_journal.account_id, 
//         posting_journal.record_uuid, posting_journal.entity_uuid,  posting_journal.reference_uuid,
//         posting_journal.currency_id, posting_journal.trans_id, posting_journal.description, 
//         posting_journal.comment, posting_journal.origin_id, posting_journal.user_id
//       FROM posting_journal
//         WHERE posting_journal.account_id=? AND 
//         (posting_journal.trans_date >=? AND posting_journal.trans_date <=?)
//       ) UNION (
//       SELECT 
//         general_ledger.project_id, general_ledger.uuid, general_ledger.trans_date, 
//         general_ledger.debit_equiv, general_ledger.credit_equiv,
//         general_ledger.debit, general_ledger.credit, general_ledger.account_id, 
//         general_ledger.record_uuid, general_ledger.entity_uuid, general_ledger.reference_uuid,
//         general_ledger.currency_id, general_ledger.trans_id, general_ledger.description, 
//         general_ledger.comment, general_ledger.origin_id, general_ledger.user_id
//       FROM general_ledger
//         WHERE general_ledger.account_id=? AND 
//         (general_ledger.trans_date >=? AND general_ledger.trans_date <=?)
//       )
//     ) AS t
//     JOIN user u ON t.user_id = u.id
//     JOIN account a ON t.account_id = a.id
//     LEFT JOIN transaction_type tr ON tr.id = t.origin_id
//     WHERE t.debit > 0 GROUP BY t.trans_id;
//   `;
//   return db.exec(query, [accountId, dateFrom, dateTo, accountId, dateFrom, dateTo]);
// }


// /**
//  * @function getExpenseReport
//  * @param {account} account id of cashbox
//  * @param {date} dateFrom A starting date
//  * @param {date} dateTo A stop date
//  */
// function getExpenseReport(accountId, dateFrom, dateTo) {
//   const query = `
//     SELECT 
//       t.project_id, BUID(t.uuid) AS uuid, t.trans_date, t.debit_equiv, 
//       t.credit_equiv, t.debit, t.credit, t.account_id, BUID(t.record_uuid) AS record_uuid,
//       BUID(t.entity_uuid) AS entity_uuid, BUID(t.reference_uuid) AS record_uuid, 
//       t.currency_id, t.trans_id, t.description, t.comment, t.origin_id, 
//       t.user_id, u.username, a.number, tr.text AS transactionType, 
//       a.label
//     FROM
//     (
//       (
//       SELECT 
//         posting_journal.project_id, posting_journal.uuid, posting_journal.trans_date, 
//         posting_journal.debit_equiv, posting_journal.credit_equiv,
//         posting_journal.debit, posting_journal.credit, posting_journal.account_id, 
//         posting_journal.record_uuid, posting_journal.entity_uuid,  posting_journal.reference_uuid,
//         posting_journal.currency_id, posting_journal.trans_id, posting_journal.description, 
//         posting_journal.comment, posting_journal.origin_id, posting_journal.user_id
//       FROM posting_journal
//         WHERE posting_journal.account_id= ? AND 
//         (posting_journal.trans_date >= ? AND posting_journal.trans_date <= ?)
//       ) UNION (
//       SELECT 
//         general_ledger.project_id, general_ledger.uuid, general_ledger.trans_date, 
//         general_ledger.debit_equiv, general_ledger.credit_equiv,
//         general_ledger.debit, general_ledger.credit, general_ledger.account_id, 
//         general_ledger.record_uuid, general_ledger.entity_uuid, 
//         general_ledger.reference_uuid, general_ledger.currency_id, general_ledger.trans_id, 
//         general_ledger.description, general_ledger.comment, general_ledger.origin_id, 
//         general_ledger.user_id
//       FROM general_ledger
//         WHERE general_ledger.account_id= ? AND 
//         (general_ledger.trans_date >= ? AND general_ledger.trans_date <= ?)
//       )
//     ) AS t
//     JOIN user u ON t.user_id = u.id
//     JOIN account a ON t.account_id = a.id
//     LEFT JOIN transaction_type tr ON tr.id = t.origin_id
//     WHERE t.credit > 0 GROUP BY t.trans_id;`;

//   return db.exec(query, [accountId, dateFrom, dateTo, accountId, dateFrom, dateTo]);
// }


/**
 * @function document
 * @description process and render the incomeExpense report document
 */
function document(req, res, next) {
  let docReport;
  const options = _.extend(req.query, {
      filename                 : 'TREE.INCOME_EXPENSE',
      csvKey                   : 'rows',
      suppressDefaultFiltering : true,
      suppressDefaultFormating : false,
    });

  try {
    docReport = new ReportManager(TEMPLATE, req.session, options);
  } catch (e) {
    next(e);
    return;
  }

  console.log('le document', docReport);

  // return docReport.render({ incomeExpense : [] })
  //   .then(result => {
  //     res.send(result);
  //     // res.set(result.headers).send(result.report);
  //   })
  //   .catch(next)
  //   .done();



  // processingIncomeExpenseReport(params)
  //   .then(incomeExpense => {
  //     incomeExpense.reportIncome = false;
  //     incomeExpense.reportExpense = false;
  //     incomeExpense.dateFrom = session.dateFrom;
  //     incomeExpense.dateTo = session.dateTo;

  //     // pick the cashbox account name
  //     if (!incomeExpense.accountName && incomeExpense.incomes.length) {
  //       incomeExpense.accountName = incomeExpense.incomes[0].label;
  //     } else if (!incomeExpense.accountName && incomeExpense.expenses && incomeExpense.expenses.length) {
  //       incomeExpense.accountName = incomeExpense.expenses[0].label;
  //     } else {
  //       incomeExpense.accountName = incomeExpense.accountName;
  //     }

  //     // pick the cashbox account Number
  //     if (!incomeExpense.accountNumber && incomeExpense.incomes.length) {
  //       incomeExpense.accountNumber = incomeExpense.incomes[0].number;
  //     } else if (!incomeExpense.accountNumber && incomeExpense.expenses && incomeExpense.expenses.length) {
  //       incomeExpense.accountNumber = incomeExpense.expenses[0].number;
  //     } else {
  //       incomeExpense.accountNumber = incomeExpense.accountNumber;
  //     }

  //     session.reportType = parseInt(session.reportType, 10);

  //     if (session.reportType === 1 || session.reportType === 2) {
  //       incomeExpense.incomes.forEach((income) => {
  //         sumIncome += income.debit;
  //       });

  //       incomeExpense.reportIncome = true;
  //       incomeExpense.sumIncome = sumIncome;
  //     }

  //     if (session.reportType === 1 || session.reportType === 3) {
  //       incomeExpense.expenses.forEach((expense) => {
  //         sumExpense += expense.credit;
  //       });

  //       incomeExpense.reportExpense = true;
  //       incomeExpense.sumExpense = sumExpense;
  //     }

  //     return documentReport.render({ incomeExpense });
  //   })
  //   .then(result => {
  //     res.set(result.headers).send(result.report);
  //   })
  //   .catch(next)
  //   .done();
}
