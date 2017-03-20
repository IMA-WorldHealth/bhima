/**
 * IncomeExpense Controller
 *
 *
 * This controller is responsible for processing incomeExpense report.
 *
 * @module finance/incomeExpense
 *
 * @requires lodash
 * @requires node-uuid
 * @requires moment
 * @requires lib/db
 * @requires lib/ReportManager
 * @requires lib/errors/BadRequest
 */


const _          = require('lodash');
const uuid       = require('node-uuid');
const moment     = require('moment');
const q          = require('q');

const db         = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');
const BadRequest = require('../../../../lib/errors/BadRequest');
const InternalServerError = require('../../../../lib/errors/InternalServerError');
const Exchange = require('../../exchange');

const TEMPLATE = './server/controllers/finance/reports/incomeExpense/report.handlebars';

// expose to the API
exports.report = report;
exports.document = document;

/**
 * @function report
 * @desc This function is responsible of generating the incomeExpense data for the report
 */
function report(req, res, next) {
  let params = req.query;

  /**
   * For allow the select of all transaction who are saved during the Date
   * Because the field trans_date is type DATETIME
   */
  params.dateTo += ' 23:59:59';

  let type = params.reportType = parseInt(params.reportType);

  const typeMapping = {
    1 : processingIncomeExpenseReport,
    2 : processingIncomeReport,
    3 : processingExpenseReport
  };

  if (!typeMapping[type]) {
    return next(new BadRequest('The report type is missing and cannot work.'));
  }

  // call the report processing function
  let promise;
  try {
    promise = typeMapping[type](params);
  } catch (e) {
    return next(e);
  }

  // once the report is rendered, return to sender
  promise
    .then(result => res.status(200).json(result))
    .catch(next);
}

/** processingIncomeExpenseReport */
function processingIncomeExpenseReport(params) {
  let glb = {};
  let exchangeRate;

  if (!params.account_id) {
    throw new BadRequest('Cashbox is missing.');
  }
  
  return Exchange.getExchangeRate(params.user.enterprise_id, params.currency_id, params.current_date)
    .then(function (exchange) {
      exchangeRate = exchange.rate ? exchange.rate : 1;

      return getIncomeReport(params.account_id, params.dateFrom, params.dateTo, exchangeRate);
    })
    .then(function (incomes) {
      glb.incomes = incomes;
      return getExpenseReport(params.account_id, params.dateFrom, params.dateTo, exchangeRate);
    })
    .then(function (expenses) {
      glb.expenses = expenses;
      return glb;
    });

}


/** processingIncomeReport */
function processingIncomeReport(params) {
  let glb = {};

  if (!params.account_id) {
    throw new BadRequest('The cashbox account ID is required.');
  }

  // get income report
  return getIncomeReport(params.account_id, params.dateFrom, params.dateTo)
    .then(function (incomes) {
      glb.incomes = incomes;
      return glb;
    });

}

/** processingExpenseReport */
function processingExpenseReport(params) {
  let glb = {};

  if (!params.account_id) {
    throw new BadRequest('The cashbox account id is required.');
  }

  // get income report
  return getExpenseReport(params.account_id, params.dateFrom, params.dateTo)
    .then(expenses => {
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
function getIncomeReport(accountId, dateFrom, dateTo, exchangeRate) {

  let query = `
    SELECT combined_ledger.trans_date, (combined_ledger.debit_equiv * ${exchangeRate}) AS debit_equiv, (combined_ledger.credit_equiv * ${exchangeRate}) AS credit_equiv,
      combined_ledger.account_id, combined_ledger.record_uuid, combined_ledger.entity_uuid,  combined_ledger.reference_uuid,
      combined_ledger.trans_id, combined_ledger.description, combined_ledger.user_id, u.username, a.number, a.label, tr.text AS transactionType
    FROM combined_ledger
    JOIN user u ON combined_ledger.user_id = u.id
    JOIN account a ON combined_ledger.account_id = a.id
    LEFT JOIN transaction_type tr ON combined_ledger.origin_id = tr.id 
    WHERE combined_ledger.account_id=? AND (DATE(combined_ledger.trans_date) >=DATE(?) AND DATE(combined_ledger.trans_date) <=DATE(?)) AND combined_ledger.debit_equiv > 0 
    GROUP BY combined_ledger.trans_id;
  `;

  return db.exec(query, [accountId, dateFrom, dateTo]);
}


/**
 * @function getExpenseReport
 * @param {account} account id of cashbox
 * @param {date} dateFrom A starting date
 * @param {date} dateTo A stop date
 */
function getExpenseReport(accountId, dateFrom, dateTo, exchangeRate) {
  let query = `
      SELECT combined_ledger.trans_date, (combined_ledger.debit_equiv * ${exchangeRate}) AS debit_equiv, (combined_ledger.credit_equiv * ${exchangeRate}) AS credit_equiv,
        combined_ledger.account_id, combined_ledger.record_uuid, combined_ledger.entity_uuid,  combined_ledger.reference_uuid,
        combined_ledger.trans_id, combined_ledger.description, combined_ledger.user_id, u.username, a.number, a.label, tr.text AS transactionType
      FROM combined_ledger
      JOIN user u ON combined_ledger.user_id = u.id
      JOIN account a ON combined_ledger.account_id = a.id
      LEFT JOIN transaction_type tr ON combined_ledger.origin_id = tr.id     
      WHERE combined_ledger.account_id=? AND (DATE(combined_ledger.trans_date) >= DATE(?) AND DATE(combined_ledger.trans_date) <= DATE(?)) AND combined_ledger.credit_equiv > 0 GROUP 
      BY combined_ledger.trans_id;
  `;

  return db.exec(query, [accountId, dateFrom, dateTo]);
}


/**
 * @function document
 * @description process and render the incomeExpense report document
 */
function document(req, res, next) {
  const session = {};
  const params = req.query;

  let report;
  let sumIncome = 0;
  let sumExpense = 0;

  session.dateFrom = params.dateFrom;
  session.dateTo = params.dateTo;
  session.reportType = params.reportType;
  session.currency_id = params.currency_id;

  _.defaults(params, { orientation : 'landscape', user : req.session.user, current_date : new Date() });

  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    return next(e);
  }

  processingIncomeExpenseReport(params)
    .then(incomeExpense => {

      incomeExpense.reportIncome = false;
      incomeExpense.reportExpense = false;
      incomeExpense.dateFrom = session.dateFrom;
      incomeExpense.dateTo = session.dateTo;
      incomeExpense.currency_id = session.currency_id;

      // pick the cashbox account name
      incomeExpense.accountName = !incomeExpense.accountName && incomeExpense.incomes.length ? incomeExpense.incomes[0].label :
      !incomeExpense.accountName  && incomeExpense.expenses && incomeExpense.expenses.length ? incomeExpense.expenses[0].label : incomeExpense.accountName;

      // pick the cashbox account Number
      incomeExpense.accountNumber = !incomeExpense.accountNumber && incomeExpense.incomes.length ? incomeExpense.incomes[0].number :
      !incomeExpense.accountNumber  && incomeExpense.expenses && incomeExpense.expenses.length ? incomeExpense.expenses[0].number : incomeExpense.accountNumber;

      session.reportType = parseInt(session.reportType);

      if (session.reportType === 1 || session.reportType === 2) {
        incomeExpense.incomes.forEach(function (income) {
          sumIncome += income.debit_equiv;
        });

        incomeExpense.reportIncome = true;
        incomeExpense.sumIncome = sumIncome;
      }

      if (session.reportType === 1 || session.reportType === 3) {
        incomeExpense.expenses.forEach(function (expense) {
          sumExpense += expense.credit_equiv;
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
