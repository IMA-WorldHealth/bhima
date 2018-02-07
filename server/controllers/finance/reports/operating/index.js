const q = require('q');
const _ = require('lodash');
const db = require('../../../../lib/db');
const util = require('../../../../lib/util');
const ReportManager = require('../../../../lib/ReportManager');

const TEMPLATE = './server/controllers/finance/reports/operating/report.handlebars';

exports.document = document;

function document(req, res, next) {

  const params = req.query;

  let docReport;
  const options = _.extend(req.query, {
    filename: 'TREE.OPERATING_ACCOUNT',
    csvKey: 'rows',
    user: req.session.user,
  });

  try {
    docReport = new ReportManager(TEMPLATE, req.session, options);
  } catch (e) {
    next(e);
    return;
  }


  const queries = [];
  // fiscal year ID
  const id = params.fiscal;
  
  getDateRange(params).then(range => {


    const typeExpense = `ACCOUNT.TYPES.EXPENSE`;
    const typeRevenue = `ACCOUNT.TYPES.REVENUE`;
    const totalRevenue = `SELECT SUM(r.amount) as total FROM (${getQuery(typeRevenue, id, range.dateFrom, range.dateTo)}) as r`;
    const totalExpense = `SELECT SUM(r.amount) as total FROM (${getQuery(typeExpense, id, range.dateFrom, range.dateTo)}) as r`;

    queries.push(db.exec(getQuery(typeExpense, id, range.dateFrom, range.dateTo)));
    queries.push(db.exec(getQuery(typeRevenue, id, range.dateFrom, range.dateTo)));
    queries.push(db.one(totalExpense));
    queries.push(db.one(totalRevenue));

    q.all(queries)
      .then(results => {
        const context = {
          expense: results[0],
          revenue: results[1],
          totalRevenue: results[2].total,
          totalExpense: results[3].total,
          dateFrom: range.dateFrom,
          dateTo: range.dateTo,
        };

        setPercent(context.expense, context.totalExpense);
        setPercent(context.revenue, context.totalRevenue);

        // diff is the result in the report
        const diff = (context.totalRevenue - context.totalExpense);
        const isExpenseHigher = context.totalExpense > context.totalRevenue;
        context.leftResult = isExpenseHigher ? diff : '';
        context.rightResult = (!isExpenseHigher) ? diff : '';

        return docReport.render(context);
      })
      .then((result) => {
        res.set(result.headers).send(result.report);
      })
      .catch(next)
      .done();

  });
}

// set the percentage of each amoun's row
function setPercent(result, total) {
  const _total = (total === 0) ? 1 : total;
  return result.forEach(row => {
    row.percent = util.roundDecimal(Math.abs((row.amount / _total) * 100), 2);
  });
}

/**
 * this function creates a query to get account amount by a certain type
 * @param {*} type is the account_type translation_key
 */
function getQuery(type, fiscalId, startDate, endDate) {

  return `
    SELECT ac.number, ac.label, ac.parent, act.translation_key, SUM(pt.credit - pt.debit) as amount
    FROM period_total as pt
    JOIN account as ac ON ac.id = pt.account_id
    JOIN account_type as act ON act.id = ac.type_id
    JOIN period as p ON  p.id = pt.period_id
    JOIN fiscal_year as fy ON fy.id = p.fiscal_year_id
    WHERE fy.id = ${fiscalId} AND 
      pt.period_id IN (
        SELECT id FROM period WHERE start_date>= ${db.escape(startDate)} AND end_date<=${db.escape(endDate)}   
      )
      AND act.translation_key = ${db.escape(type)}
    GROUP BY pt.account_id 
  `;
}


function getDateRange(params) {
  const sql =
    `
    SELECT
      MIN(start_date) AS dateFrom, MAX(end_date) AS dateTo
    FROM
      period
    WHERE
      period.id IN (${params.periodFrom}, ${params.periodTo})`;

  return db.one(sql);
}
