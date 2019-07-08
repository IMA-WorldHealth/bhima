/**
 * NOTE(@jniles) - this is the comptes d'exploitation in French.
 */

const q = require('q');
const _ = require('lodash');
const Exchange = require('../../../finance/exchange');
const db = require('../../../../lib/db');
const util = require('../../../../lib/util');
const Tree = require('../../../../lib/Tree');
const ReportManager = require('../../../../lib/ReportManager');

const fiscal = require('../../fiscal');

const TEMPLATE = './server/controllers/finance/reports/operating/report.handlebars';

exports.document = document;
exports.formatData = formatData;
exports.reporting = reporting;

const EXPENSE_ACCOUNT_TYPE = 5;
const INCOME_ACCOUNT_TYPE = 4;
const DECIMAL_PRECISION = 2; // ex: 12.4567 => 12.46

/**
 * @description this function helps to get html document of the report in server side
 * so that we can use it with others modules on the server side
 * @param {*} options the report options
 * @param {*} session the session
 */
function reporting(opts, session) {
  const params = opts;
  let docReport;
  const options = _.extend(opts, {
    filename : 'TREE.OPERATING_ACCOUNT',
    csvKey : 'rows',
    user : session.user,
  });

  try {
    docReport = new ReportManager(TEMPLATE, session, options);
  } catch (e) {
    throw e;
  }

  let queries;
  let range;
  let lastRateUsed;
  let firstCurrency;
  let secondCurrency;
  const enterpriseId = session.enterprise.id;
  const enterpriseCurrencyId = session.enterprise.currency_id;
  const getQueryIncome = fiscal.getAccountBalancesByTypeId;

  const periods = {
    periodFrom : params.periodFrom,
    periodTo : params.periodTo,
  };

  return fiscal.getDateRangeFromPeriods(periods).then(dateRange => {
    range = dateRange;
    return Exchange.getExchangeRate(enterpriseId, params.currency_id, range.dateTo);
  }).then(exchangeRate => {
    firstCurrency = enterpriseCurrencyId;
    secondCurrency = params.currency_id;
    lastRateUsed = exchangeRate.rate;

    if (lastRateUsed && lastRateUsed < 1) {
      lastRateUsed = (1 / lastRateUsed);
      firstCurrency = params.currency_id;
      secondCurrency = enterpriseCurrencyId;
    }

    const rate = exchangeRate.rate || 1;

    const totalIncome = `SELECT SUM(r.amount) as total FROM (${getQueryIncome(rate)}) as r`;
    const totalExpense = `SELECT SUM(r.amount) as total FROM (${fiscal.getAccountBalancesByTypeId(rate)}) as r`;

    const expenseParams = [
      params.fiscal,
      range.dateFrom,
      range.dateTo,
      EXPENSE_ACCOUNT_TYPE,
    ];

    const incomeParams = [
      params.fiscal,
      range.dateFrom,
      range.dateTo,
      INCOME_ACCOUNT_TYPE,
    ];

    queries = [
      db.exec(fiscal.getAccountBalancesByTypeId(rate), expenseParams),
      db.exec(getQueryIncome(rate), incomeParams),
      db.one(totalExpense, expenseParams),
      db.one(totalIncome, incomeParams),
    ];

    return q.all(queries);
  })
    .spread((expense, revenue, totalExpense, totalIncome) => {
      // Income accounts usually have a negative balance,
      // which is why to display these values you will need to multiply it by (-1)
      revenue.forEach(item => {
        item.amount *= (-1);
      });

      // The Total Income is also multiplied by -1 for not having to display a negative value
      totalIncome.total *= (-1);

      const context = {
        expense : prepareTree(expense, 'type_id', EXPENSE_ACCOUNT_TYPE, 'amount'),
        revenue : prepareTree(revenue, 'type_id', INCOME_ACCOUNT_TYPE, 'amount'),
        totalExpense : totalExpense.total,
        totalIncome : totalIncome.total,
        dateFrom : range.dateFrom,
        dateTo : range.dateTo,
        currencyId : params.currency_id,
        firstCurrency,
        secondCurrency,
        rate : lastRateUsed,
      };

      formatData(context.expense, context.totalExpense, DECIMAL_PRECISION);
      formatData(context.revenue, context.totalIncome, DECIMAL_PRECISION);
      const diff = util.roundDecimal((context.totalIncome - context.totalExpense), DECIMAL_PRECISION);
      context.totalIncome = util.roundDecimal(context.totalIncome, DECIMAL_PRECISION);
      context.totalExpense = util.roundDecimal(context.totalExpense, DECIMAL_PRECISION);
      context.total = diff;

      return docReport.render(context);
    });
}

function document(req, res, next) {
  reporting(req.query, req.session)
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

// create the tree structure, filter by property and sum nodes' summableProp
function prepareTree(data, prop, value, summableProp) {
  const tree = new Tree(data);
  try {
    tree.filterByLeaf(prop, value);
    tree.walk(Tree.common.sumOnProperty(summableProp), false);
    tree.walk(Tree.common.computeNodeDepth);
    return tree.toArray();
  } catch (error) {
    return [];
  }

}

// set the percentage of each amoun's row,
// round amounts
function formatData(result, total, decimalPrecision) {
  const _total = (total === 0) ? 1 : total;
  return result.forEach(row => {
    row.title = (row.depth < 3);

    if (row.title) {
      row.percent = util.roundDecimal(Math.abs((row.amount / _total) * 100), decimalPrecision);
    }

    row.amount = util.roundDecimal(row.amount, decimalPrecision);
  });
}
