const q = require('q');
const _ = require('lodash');
const db = require('../../../../lib/db');
const util = require('../../../../lib/util');
const Tree = require('../../../../lib/Tree');
const ReportManager = require('../../../../lib/ReportManager');

const fiscal = require('../../fiscal');

const TEMPLATE = './server/controllers/finance/reports/operating/report.handlebars';

exports.document = document;

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


  const queries = [];
  let range;
  const EXPENSE_ACCOUNT_TYPE = 5;
  const INCOME_ACCOUNT_TYPE = 4;
  const DECIMAL_PRECISION = 2; // ex: 12.4567 => 12.46

  const getQuery = fiscal.accountBanlanceByTypeId;

  const periods = {
    periodFrom : params.periodFrom,
    periodTo : params.periodTo,
  };

  fiscal.getDateRangeFromPeriods(periods).then(dateRange => {
    range = dateRange;

    const totalIncome = `SELECT SUM(r.amount) as total FROM (${getQuery()}) as r`;
    const totalExpense = `SELECT SUM(r.amount) as total FROM (${getQuery()}) as r`;
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

    queries.push(db.exec(getQuery(), expenseParams));
    queries.push(db.exec(getQuery(), incomeParams));
    queries.push(db.one(totalExpense, expenseParams));
    queries.push(db.one(totalIncome, incomeParams));

    return q.all(queries);
  })
    .spread((expense, revenue, totalExpense, totalIncome) => {
      const context = {
        expense,
        revenue,
        totalExpense : totalExpense.total,
        totalIncome : totalIncome.total,
        dateFrom : range.dateFrom,
        dateTo : range.dateTo,
      };

      const revenueTree = new Tree(context.revenue);
      revenueTree.walk(Tree.common.computeNodeDepth);
      revenueTree.filterByLeaf('type_id', INCOME_ACCOUNT_TYPE);
      revenueTree.walk(Tree.common.sumOnProperty('amount'), false);
      context.revenue = revenueTree.toArray();

      const expenseTree = new Tree(context.expense);
      expenseTree.walk(Tree.common.computeNodeDepth);
      expenseTree.filterByLeaf('type_id', EXPENSE_ACCOUNT_TYPE);
      expenseTree.walk(Tree.common.sumOnProperty('amount'), false);
      context.expense = expenseTree.toArray();

      formatData(context.expense, context.totalExpense, DECIMAL_PRECISION);
      formatData(context.revenue, context.totalIncome, DECIMAL_PRECISION);

      // diff is the result in the report
      const diff = util.roundDecimal((context.totalIncome - context.totalExpense), DECIMAL_PRECISION);
      context.totalIncome = util.roundDecimal(context.totalIncome, DECIMAL_PRECISION);
      context.totalExpense = util.roundDecimal(context.totalExpense, DECIMAL_PRECISION);
      const isExpenseHigher = context.totalExpense < context.totalIncome;
      // the result position is usefull for balancing
      context.leftResult = isExpenseHigher ? diff : '';
      context.rightResult = (!isExpenseHigher) ? diff : '';

      return docReport.render(context);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

// set the percentage of each amount's row,
// round amounts
function formatData(result, total, decimalPrecision) {
  const _total = (total === 0) ? 1 : total;

  return result.forEach(row => {
    row.depth--;
    if (row.depth < 2) {
      row.percent = util.roundDecimal(Math.abs((row.amount / _total) * 100), decimalPrecision);
    }
    row.amount = util.roundDecimal(row.amount, decimalPrecision);
    row.title = row.depth === 1;
  });
}
