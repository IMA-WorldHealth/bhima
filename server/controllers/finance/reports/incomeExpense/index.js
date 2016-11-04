/**
 * AgedDebtors Controller
 *
 *
 * This controller is responsible for processing agedDebtors report.
 *
 * @module finance/aged Debtors
 *
 * @requires lodash
 * @requires node-uuid
 * @requires moment
 * @requires lib/db
 * @requires lib/util
 * @requires lib/ReportManager
 * @requires lib/errors/BadRequest
 */

'use strict';

const _             = require('lodash');
const uuid          = require('node-uuid');
const moment        = require('moment');
const db            = require('../../../../lib/db');
const transaction   = db.transaction();
const util          = require('../../../../lib/util');
const ReportManager = require('../../../../lib/ReportManager');
const BadRequest    = require('../../../../lib/errors/BadRequest');

const TEMPLATE = './server/controllers/finance/reports/incomeExpense/report.handlebars';

// expose to the API
exports.document = document;

/** processingIncomeExpenseReport */
function processingIncomeExpenseReport(params) {
  let glb = {};

  if (!params.account_id) {
    throw new BadRequest('Cashbox is missing', 'ERRORS.BAD_REQUEST');
  }

  return getIncomeReport(params.account_id, params.dateFrom, params.dateTo)
    .then(function (incomes) {
      glb.incomes = incomes;
      
      return getExpenseReport(params.account_id, params.dateFrom, params.dateTo);
    })
    .then(function (expenses) {
      glb.expenses = expenses;

      return glb;
    });
}

/**
 * @function getIncomeReport
 * @param {account} account id of cashbox
 * @param {date} dateFrom A starting date
 * @param {date} dateTo A stop date
 */
function getIncomeReport(accountId, dateFrom, dateTo) {
  let query =`
    SELECT t.project_id, BUID(t.uuid) AS uuid, t.trans_date, t.debit_equiv, t.credit_equiv, t.debit, t.credit, t.account_id, BUID(t.record_uuid) AS record_uuid,
    BUID(t.entity_uuid) AS entity_uuid,  BUID(t.reference_uuid) AS record_uuid, t.currency_id, t.trans_id, t.description, t.comment, t.origin_id, t.user_id, u.username,
    a.number, tr.text AS transactionType, a.label 
    FROM 
    (
      (
      SELECT posting_journal.project_id, posting_journal.uuid, posting_journal.trans_date, posting_journal.debit_equiv, posting_journal.credit_equiv,
        posting_journal.debit, posting_journal.credit, posting_journal.account_id, posting_journal.record_uuid, posting_journal.entity_uuid,  posting_journal.reference_uuid,
        posting_journal.currency_id, posting_journal.trans_id, posting_journal.description, posting_journal.comment, posting_journal.origin_id, posting_journal.user_id 
      FROM posting_journal
        WHERE posting_journal.account_id=? AND (posting_journal.trans_date >=? AND posting_journal.trans_date <=?)
      ) UNION (
      SELECT general_ledger.project_id, general_ledger.uuid, general_ledger.trans_date, general_ledger.debit_equiv, general_ledger.credit_equiv,
        general_ledger.debit, general_ledger.credit, general_ledger.account_id, general_ledger.record_uuid, general_ledger.entity_uuid,  general_ledger.reference_uuid,
        general_ledger.currency_id, general_ledger.trans_id, general_ledger.description, general_ledger.comment, general_ledger.origin_id, general_ledger.user_id 
      FROM general_ledger
        WHERE general_ledger.account_id=? AND (general_ledger.trans_date >=? AND general_ledger.trans_date <=?)
      )   
    ) AS t  
    JOIN user u ON t.user_id = u.id
    JOIN account a ON t.account_id = a.id
    LEFT JOIN transaction_type tr ON tr.id = t.origin_id
    WHERE t.debit > 0 GROUP BY t.trans_id;`;
  return db.exec(query, [accountId, dateFrom, dateTo, accountId, dateFrom, dateTo]);
}


/**
 * @function getExpenseReport
 * @param {account} account id of cashbox
 * @param {date} dateFrom A starting date
 * @param {date} dateTo A stop date
 */
function getExpenseReport(accountId, dateFrom, dateTo) {
  let query =`
    SELECT t.project_id, BUID(t.uuid) AS uuid, t.trans_date, t.debit_equiv, t.credit_equiv, t.debit, t.credit, t.account_id, BUID(t.record_uuid) AS record_uuid,
    BUID(t.entity_uuid) AS entity_uuid,  BUID(t.reference_uuid) AS record_uuid, t.currency_id, t.trans_id, t.description, t.comment, t.origin_id, t.user_id, u.username, 
    a.number, tr.text AS transactionType, a.label
    FROM 
    (
      (
      SELECT posting_journal.project_id, posting_journal.uuid, posting_journal.trans_date, posting_journal.debit_equiv, posting_journal.credit_equiv,
        posting_journal.debit, posting_journal.credit, posting_journal.account_id, posting_journal.record_uuid, posting_journal.entity_uuid,  posting_journal.reference_uuid,
        posting_journal.currency_id, posting_journal.trans_id, posting_journal.description, posting_journal.comment, posting_journal.origin_id, posting_journal.user_id 
      FROM posting_journal
        WHERE posting_journal.account_id=? AND (posting_journal.trans_date >=? AND posting_journal.trans_date <=?)
      ) UNION (
      SELECT general_ledger.project_id, general_ledger.uuid, general_ledger.trans_date, general_ledger.debit_equiv, general_ledger.credit_equiv,
        general_ledger.debit, general_ledger.credit, general_ledger.account_id, general_ledger.record_uuid, general_ledger.entity_uuid,  general_ledger.reference_uuid,
        general_ledger.currency_id, general_ledger.trans_id, general_ledger.description, general_ledger.comment, general_ledger.origin_id, general_ledger.user_id 
      FROM general_ledger
        WHERE general_ledger.account_id=? AND (general_ledger.trans_date >=? AND general_ledger.trans_date <=?)
      )   
    ) AS t  
    JOIN user u ON t.user_id = u.id
    JOIN account a ON t.account_id = a.id
    LEFT JOIN transaction_type tr ON tr.id = t.origin_id
    WHERE t.credit > 0 GROUP BY t.trans_id;`;

  return db.exec(query, [accountId, dateFrom, dateTo, accountId, dateFrom, dateTo]);
}


/**
 * @function document
 * @description process and render the agedDebtors report document
 */
function document(req, res, next) {
  const session = {};
  const params = req.query;
  params.user = req.session.user;

  let report;
  let sumIncome = 0;
  let sumExpense = 0;

  session.dateFrom = params.dateFrom;
  session.dateTo = params.dateTo;
  session.reportType = params.reportType;
  

  _.defaults(params, { orientation : 'landscape' });

  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    return next(e);
  }

  processingIncomeExpenseReport(params)
    .then(incomeExpense => {
      // pick the cashbox account name
      incomeExpense.accountName = !incomeExpense.accountName && incomeExpense.incomes.length ? incomeExpense.incomes[0].label :
      !incomeExpense.accountName  && incomeExpense.expenses ? incomeExpense.expenses[0].label : incomeExpense.accountName;

      // pick the cashbox account Number
      incomeExpense.accountNumber = !incomeExpense.accountNumber && incomeExpense.incomes.length ? incomeExpense.incomes[0].number :
      !incomeExpense.accountNumber  && incomeExpense.expenses ? incomeExpense.expenses[0].number : incomeExpense.accountNumber;

      session.reportType = parseInt(session.reportType);

      if(session.reportType === 1 || session.reportType === 2){
        incomeExpense.incomes.forEach(function (income) {
          sumIncome += income.debit;
        });   

        incomeExpense.reportIncome = true;
        incomeExpense.sumIncome = sumIncome;
      }

      if(session.reportType === 1 || session.reportType === 3){
        incomeExpense.expenses.forEach(function (expense) {
          sumExpense += expense.credit;
        }); 

        incomeExpense.reportExpense = true;
        incomeExpense.sumExpense = sumExpense;     
      }

      return report.render({ incomeExpense });
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();

}