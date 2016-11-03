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
 * @requires lib/util
 * @requires lib/ReportManager
 * @requires lib/errors/BadRequest
 */

'use strict';

const _          = require('lodash');
const uuid       = require('node-uuid');
const moment     = require('moment');

const db         = require('../../../../lib/db');
const util       = require('../../../../lib/util');
const ReportManager = require('../../../../lib/ReportManager');
const BadRequest = require('../../../../lib/errors/BadRequest');

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

  params.reportType = parseInt(params.reportType);


  if(params.reportType === 1){
    // Income and expense report
    processingIncomeExpenseReport(params)
    .then(result => {
      res.status(200).json(result);
    })
    .catch(next);

  } else if (params.reportType === 2){
    // Income Report
    processingIncomeReport(params)
    .then(result => {
      res.status(200).json(result);
    })
    .catch(next);

  } else if (params.reportType === 3){
    // Expense Report
    processingExpenseReport(params)
    .then(result => {
      res.status(200).json(result);
    })
    .catch(next);
  } else {
    throw new BadRequest('Report Type is missing', 'ERRORS.BAD_REQUEST');
  }

}

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


/** processingIncomeReport */
function processingIncomeReport(params) {
  let glb = {};

  if (!params.account_id) {
    throw new BadRequest('Cashbox is missing', 'ERRORS.BAD_REQUEST');
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
    throw new BadRequest('Cashbox is missing', 'ERRORS.BAD_REQUEST');
  }

  // get income report
  return getExpenseReport(params.account_id, params.dateFrom, params.dateTo)
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
    a.number, tr.text AS transactionType
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
    a.number, tr.text AS transactionType
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
 * @description process and render the incomeExpense report document
 */
function document(req, res, next) {
  const session = {};
  const params = req.query;

  let report;

  session.dateFrom = params.dateFrom;
  session.dateTo = params.dateTo;

  _.defaults(params, { orientation : 'landscape' });

  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    return next(e);
  }

  processingIncomeExpenseReport(params)
    .then(reporting)
    .then(labelization)
    .then(() => report.render(session))
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);

  /**
   * @function reporting
   * @param {array} rows all transactions of the given cashbox
   * @description
   * processing data for the report, the process is as follow
   * step 1. initialization : initialize all global array and objects
   * step 2. openning balance : process for getting the openning balance
   * step 3. grouping : group incomes and expenses by periods
   * step 4. summarization : get all periodical openning balance
   * step 5. labelization : define unique labels for incomes and expenses,
   * and process all totals needed
   * @todo: Must convert values with enterprise exchange rate
   */
  function reporting(rows) {
    initialization();

    session.periodicData = rows.flows;
    /** @todo: convert into enterprise currency */
    session.openningBalance = rows.openningBalance.balance;

    session.periodicData.forEach(function (flow) {
      groupingResult(flow.incomes, flow.expenses, moment(flow.period.start_date).format('YYYY-MM-DD'));
    });

    session.periodStartArray = session.periodicData.map(function (flow) {
      return moment(flow.period.start_date).format('YYYY-MM-DD');
    });

    /** openning balance by period */
    session.periodicData.forEach(function (flow) {
      summarization(moment(flow.period.start_date).format('YYYY-MM-DD'));
    });
  }

  /**
   * @function initialization
   * @description initialize global arrays and objects for the incomeExpense report
   */
  function initialization () {
    session.incomes          = {};
    session.expenses         = {};
    session.summationIncome  = {};
    session.summationExpense = {};
    session.sum_incomes      = {};
    session.sum_expense      = {};
    session.periodicBalance  = {};
    session.periodicOpenningBalance = {};
    session.incomesLabels    = [];
    session.expensesLabels   = [];
    session.totalIncomes     = {};
    session.totalExpenses    = {};
  }

  /**
   * @function summarization
   * @param {object} period An object wich reference a specific period
   * @description process for getting openning balance for each periods
   */
  function summarization (period){
    session.sum_incomes[period] = 0;
    session.sum_expense[period] = 0;

    if(session.summationIncome[period]) {
      session.summationIncome[period].forEach(function (transaction) {
        // if only cashes values must be in only enterprise currency
        /** @todo: convert into enterprise currency */
        session.sum_incomes[period] += transaction.value;
        session.incomesLabels.push(transaction.transfer_type);
      });
    }

    if(session.summationExpense[period]) {
      session.summationExpense[period].forEach(function (transaction) {
        // if only cashes values must be in only enterprise currency
        /** @todo: convert into enterprise currency */
        session.sum_expense[period] += transaction.value;
        session.expensesLabels.push(transaction.transfer_type);
      });
    }

    session.periodicBalance[period] = isFirstPeriod(period) ?
      session.openningBalance + session.sum_incomes[period] - session.sum_expense[period] :
      session.periodicBalance[previousPeriod(period)] + session.sum_incomes[period] - session.sum_expense[period];

    session.periodicOpenningBalance[period] = isFirstPeriod(period) ?
      session.openningBalance :
      session.periodicBalance[previousPeriod(period)];

  }

  /**
   * @function isFirstPeriod
   * @param {object} period An object wich reference a specific period
   * @description process to know the first period in the fiscal year
   */
  function isFirstPeriod(period) {
    var reference = session.periodStartArray[0];

    var bool = (new Date(reference).getDate() === 1 && new Date(reference).getMonth() === 0) ?
      new Date(period).getDate() === 1 && new Date(period).getMonth() === 0 :
      new Date(period).getDate() === new Date(reference).getDate() &&
      new Date(period).getMonth() === new Date(reference).getMonth() &&
      new Date(period).getYear() === new Date(reference).getYear();

    return bool;
  }

  /**
   * @function previousPeriod
   * @param {object} period An object wich reference a specific period
   * @description process to know the previous period of the given period
   */
  function previousPeriod(period) {
    var currentIndex = session.periodStartArray.indexOf(moment(period).format('YYYY-MM-DD'));
    return (currentIndex !== 0) ? session.periodStartArray[currentIndex - 1] : session.periodStartArray[currentIndex];
  }

  /**
   * @function labelization
   * @description process for getting unique labels for incomes and expenses,
   * and all totals needed
   */
  function labelization () {
    var uniqueIncomes = [], uniqueExpenses = [];
    session.incomesLabels = util.uniquelize(session.incomesLabels);
    session.expensesLabels = util.uniquelize(session.expensesLabels);

    /** incomes rows */
    session.periodStartArray.forEach(function (period) {
      session.incomes[period] = {};
      session.incomesLabels.forEach(function (label) {
        session.summationIncome[period].forEach(function (transaction) {
          if (transaction.transfer_type === label) {
            /** @todo: convert into enterprise currency */
            session.incomes[period][label] = transaction.value;
          }
        });
      });
    });

    /** totals incomes rows */
    session.periodStartArray.forEach(function (period) {
      session.totalIncomes[period] = 0;
      session.summationIncome[period].forEach(function (transaction) {
        /** @todo: convert into enterprise currency */
        session.totalIncomes[period] += transaction.value;
      });
    });

    /** expense rows */
    session.periodStartArray.forEach(function (period) {
      session.expenses[period] = {};
      session.expensesLabels.forEach(function (label) {
        session.summationExpense[period].forEach(function (transaction) {
          if (transaction.transfer_type === label) {
            /** @todo: convert into enterprise currency */
            session.expenses[period][label] = transaction.value;
          }
        });
      });
    });

    /** totals expenses rows */
    session.periodStartArray.forEach(function (period) {
      session.totalExpenses[period] = 0;
      session.summationExpense[period].forEach(function (transaction) {
        /** @todo: convert into enterprise currency */
        session.totalExpenses[period] += transaction.value;
      });
    });

  }

  /**
   * @function groupingResult
   * @param {object} period An object wich reference a specific period
   * @param {array} incomes An array which contain incomes for the period
   * @param {array} expenses An array which contain expenses for the period
   * @description group incomes and expenses by origin_id for each period
   */
  function groupingResult (incomes, expenses, period) {
    var tempIncome  = {},
        tempExpense = {};

    session.summationIncome[period] = [];
    session.summationExpense[period] = [];

    // pick the cashbox account name
    session.accountName = !session.accountName && incomes.length ? incomes[0].label :
      !session.accountName && expenses.lenght ? expenses[0].label : session.accountName;

    // income
    if (incomes) {
      incomes.forEach(function (item, index) {
        tempIncome[item.origin_id] = typeof tempIncome[item.origin_id] !== 'undefined' ? false : true;

        if (tempIncome[item.origin_id] === true) {
          var value = incomes.reduce(function (a, b) {
            return b.origin_id === item.origin_id ? b.debit_equiv + a : a;
          }, 0);
          session.summationIncome[period].push({
            'transfer_type' : item.transactionType,
            'currency_id'   : item.currency_id,
            'value'         : value
          });
        }
      });
    }

    // Expense
    if (expenses) {
      expenses.forEach(function (item, index) {
        tempExpense[item.origin_id] = typeof tempExpense[item.origin_id] !== 'undefined' ? false : true;

        if (tempExpense[item.origin_id] === true) {
          var value = expenses.reduce(function (a, b) {
            return b.origin_id === item.origin_id ? b.credit_equiv + a : a;
          }, 0);
          session.summationExpense[period].push({
            'transfer_type' : item.transactionType,
            'currency_id'   : item.currency_id,
            'value'         : value
          });
        }
      });
    }
  }
}
