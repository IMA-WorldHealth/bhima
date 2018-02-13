const q = require('q');
const _ = require('lodash');
const db = require('../../../../lib/db');
const util = require('../../../../lib/util');
const Tree = require('../../../../lib/Tree');
const ReportManager = require('../../../../lib/ReportManager');

const fiscal = require('../../fiscal');

const TEMPLATE = './server/controllers/finance/reports/hgr_report/report.handlebars';

exports.document = document;

function document(req, res, next) {
  const params = req.query;

  let docReport;
  const options = _.extend(req.query, {
    filename : 'TREE.HGR_FINANCIAL_REPORT',
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
    const totalReceivables = `SELECT SUM(r.amount) as total FROM (${fiscal.receivables()}) as r`;
    const totalDebts = `SELECT SUM(r.amount) as total FROM (${fiscal.debts()}) as r`;

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

    const receivablesParams = [
      params.fiscal,
      range.dateFrom,
      range.dateTo,
    ];
    queries.push(db.exec(getQuery(), expenseParams));
    queries.push(db.exec(getQuery(), incomeParams));
    queries.push(db.exec(fiscal.receivables(), receivablesParams));
    queries.push(db.exec(fiscal.debts(), receivablesParams));
    queries.push(db.one(totalExpense, expenseParams));
    queries.push(db.one(totalIncome, incomeParams));
    queries.push(db.one(totalReceivables, receivablesParams));
    queries.push(db.one(totalDebts, receivablesParams));
    return q.all(queries);
  })
    .spread((expense, revenue, receivables, debts, totalExpense, totalIncome, totalReceivables, totalDebts) => {
      const context = {
        expense : prepareTree(expense, 'type_id', EXPENSE_ACCOUNT_TYPE, 'amount'),
        revenue :  prepareTree(revenue, 'type_id', INCOME_ACCOUNT_TYPE, 'amount'),
        receivables : prepareTree(receivables, 'concerned', 1, 'amount'),
        debts : prepareTree(debts, 'concerned', 1, 'amount'),
        totalExpense : totalExpense.total,
        totalIncome : totalIncome.total,
        totalReceivables : totalReceivables.total,
        totalDebts : totalDebts.total,
        dateFrom : range.dateFrom,
        dateTo : range.dateTo,
      };

      formatData(context.expense, context.totalExpense, DECIMAL_PRECISION);
      formatData(context.revenue, context.totalIncome, DECIMAL_PRECISION);
      formatData(context.receivables, context.totalReceivables, DECIMAL_PRECISION);
      formatData(context.debts, context.totalDebts, DECIMAL_PRECISION);

      context.totalAsset = util.roundDecimal((context.totalIncome + context.totalReceivables), DECIMAL_PRECISION);

      context.totalLiability = util.roundDecimal((context.totalExpense + context.totalDebts), DECIMAL_PRECISION);

      context.totalIncome = util.roundDecimal(context.totalIncome, DECIMAL_PRECISION);
      context.totalExpense = util.roundDecimal(context.totalExpense, DECIMAL_PRECISION);
      context.totalReceivables = util.roundDecimal(context.totalReceivables, DECIMAL_PRECISION);
      context.totalDebts = util.roundDecimal(context.totalDebts, DECIMAL_PRECISION);


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
  tree.filterByLeaf(prop, value);
  if (tree._data.length > 0) {

    tree.sumOnProperty(summableProp);
    return tree.toArray();
  }
  return [];
}

// set the percentage of each amoun's row,
// round amounts
function formatData(result, total, decimalPrecision) {
  const _total = (total === 0) ? 1 : total;
  return result.forEach(row => {
    if (row.depth < 2) {
      row.percent = util.roundDecimal(Math.abs((row.amount / _total) * 100), decimalPrecision);
    }
    row.amount = util.roundDecimal(row.amount, decimalPrecision);
    row.title = row.depth <= 1;
  });
}
