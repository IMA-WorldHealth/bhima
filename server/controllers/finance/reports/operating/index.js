/**
 * NOTE(@jniles) - this is the comptes d'exploitation in French.
 */

const q = require('q');
const _ = require('lodash');
const db = require('../../../../lib/db');
const util = require('../../../../lib/util');
const Tree = require('../../../../lib/Tree');
const ReportManager = require('../../../../lib/ReportManager');

const fiscal = require('../../fiscal');

const TEMPLATE = './server/controllers/finance/reports/operating/report.handlebars';

exports.document = document;
exports.formatData = formatData;

const EXPENSE_ACCOUNT_TYPE = 5;
const INCOME_ACCOUNT_TYPE = 4;
const DECIMAL_PRECISION = 2; // ex: 12.4567 => 12.46

/**
 * return a query for retrieving account's balance by type_id and periods
 * This function does exactly the same thing except the value of amount will be
 * debit - credit this will know the expense account
 */
function getQueryExpense() {
  return `
    SELECT ac.id, ac.number, ac.label, ac.parent, IFNULL(s.amount, 0) AS amount, s.type_id

    FROM account as ac LEFT JOIN (
    SELECT SUM(pt.debit - pt.credit) as amount, pt.account_id, act.id as type_id
    FROM period_total as pt
    JOIN account as a ON a.id = pt.account_id
    JOIN account_type as act ON act.id = a.type_id
    JOIN period as p ON  p.id = pt.period_id
    JOIN fiscal_year as fy ON fy.id = p.fiscal_year_id
    WHERE fy.id = ? AND
      pt.period_id IN (
        SELECT id FROM period WHERE start_date>= ? AND end_date<= ?
      )
      AND act.id = ?
    GROUP BY pt.account_id
    )s ON ac.id = s.account_id
    WHERE ac.locked = 0
    ORDER BY ac.number
  `;
}

function document(req, res, next) {
  const params = req.query;

  let docReport;
  const options = _.extend(req.query, {
    filename : 'TREE.OPERATING_ACCOUNT',
    csvKey : 'rows',
    user : req.session.user,
  });

  try {
    docReport = new ReportManager(TEMPLATE, req.session, options);
  } catch (e) {
    next(e);
    return;
  }

  let queries;
  let range;

  const getQueryIncome = fiscal.getAccountBalancesByTypeId;

  const periods = {
    periodFrom : params.periodFrom,
    periodTo : params.periodTo,
  };

  fiscal.getDateRangeFromPeriods(periods).then(dateRange => {
    range = dateRange;

    const totalIncome = `SELECT SUM(r.amount) as total FROM (${getQueryIncome()}) as r`;
    const totalExpense = `SELECT SUM(r.amount) as total FROM (${getQueryExpense()}) as r`;

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
      db.exec(getQueryExpense(), expenseParams),
      db.exec(getQueryIncome(), incomeParams),
      db.one(totalExpense, expenseParams),
      db.one(totalIncome, incomeParams),
    ];

    return q.all(queries);
  })
    .spread((expense, revenue, totalExpense, totalIncome) => {
      const context = {
        expense : prepareTree(expense, 'type_id', EXPENSE_ACCOUNT_TYPE, 'amount'),
        revenue : prepareTree(revenue, 'type_id', INCOME_ACCOUNT_TYPE, 'amount'),
        totalExpense : totalExpense.total,
        totalIncome : totalIncome.total,
        dateFrom : range.dateFrom,
        dateTo : range.dateTo,
        currencyId : req.session.enterprise.currency_id,
      };

      formatData(context.expense, context.totalExpense, DECIMAL_PRECISION);
      formatData(context.revenue, context.totalIncome, DECIMAL_PRECISION);

      const diff = util.roundDecimal((context.totalIncome - context.totalExpense), DECIMAL_PRECISION);
      context.totalIncome = util.roundDecimal(context.totalIncome, DECIMAL_PRECISION);
      context.totalExpense = util.roundDecimal(context.totalExpense, DECIMAL_PRECISION);
      context.total = diff;

      return docReport.render(context);
    })
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
