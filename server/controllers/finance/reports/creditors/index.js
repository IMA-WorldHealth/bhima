/**
 * @overview finance/reports/creditors/index.js
 *
 * @description
 * This report displays the debts of the company
 *
 * The typical age categories are 0-30 days, 30-60 days, 60-90 days, and > 90
 * days.
 *
 */


const _ = require('lodash');
const ReportManager = require('../../../../lib/ReportManager');
const db = require('../../../../lib/db');

// path to the template to render
const TEMPLATE = './server/controllers/finance/reports/creditors/aged.handlebars';

/**
 * @method agedCreditorReport
 *
 * @description
 * The HTTP interface which actually creates the report.
 */
function agedCreditorReport(req, res, next) {
  const qs = _.extend(req.query, { csvKey : 'creditors' });
  const metadata = _.clone(req.session);

  let report;

  try {
    report = new ReportManager(TEMPLATE, metadata, qs);
  } catch (e) {
    next(e);
    return;
  }

  // fire the SQL for the report
  queryContext(qs)
    .then(data => report.render(data))
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

/**
 * @method queryContext
 *
 * @param {Object} params Parameters passed in to customise the report - these
 *                        are usually passed in through the query string
 * @description
 * The HTTP interface which actually creates the report.
 */
function queryContext(queryParams) {
  const params = queryParams || {};
  const havingNonZeroValues = ' HAVING total > 0 ';
  const includeZeroes = Boolean(Number(params.zeroes));

  // format the dates for MySQL escape
  const dates = _.fill(Array(5), new Date(params.date));

  const data = {};
  const source = 'general_ledger';

  // selects into columns of 30, 60, 90, and >90
  const creditorSql = `
    SELECT BUID(cg.uuid) AS id, cg.name, a.number,
      SUM(IF(DATEDIFF(DATE(?), DATE(gl.trans_date)) BETWEEN 0 AND 29, gl.credit_equiv - gl.debit_equiv, 0)) AS thirty,
      SUM(IF(DATEDIFF(DATE(?), DATE(gl.trans_date)) BETWEEN 30 AND 59, gl.credit_equiv - gl.debit_equiv, 0)) AS sixty,
      SUM(IF(DATEDIFF(DATE(?), DATE(gl.trans_date)) BETWEEN 60 AND 89, gl.credit_equiv - gl.debit_equiv, 0)) AS ninety,
      SUM(IF(DATEDIFF(DATE(?), DATE(gl.trans_date)) > 90, gl.credit_equiv - gl.debit_equiv, 0)) AS excess,
      SUM(gl.credit_equiv - gl.debit_equiv) AS total
    FROM creditor_group AS cg
      JOIN ${source} AS gl ON gl.account_id = cg.account_id
      JOIN account AS a ON a.id = cg.account_id
    WHERE DATE(gl.trans_date) <= DATE(?)
    GROUP BY cg.uuid
    ${includeZeroes ? '' : havingNonZeroValues}
    ORDER BY cg.name;
  `;

  // aggregates the data above as totals into columns of 30, 60, 90, and >90
  const aggregateSql = `
    SELECT
      SUM(IF(DATEDIFF(DATE(?), DATE(gl.trans_date)) BETWEEN 0 AND 29, gl.credit_equiv - gl.debit_equiv, 0)) AS thirty,
      SUM(IF(DATEDIFF(DATE(?), DATE(gl.trans_date)) BETWEEN 30 AND 59, gl.credit_equiv - gl.debit_equiv, 0)) AS sixty,
      SUM(IF(DATEDIFF(DATE(?), DATE(gl.trans_date)) BETWEEN 60 AND 89, gl.credit_equiv - gl.debit_equiv, 0)) AS ninety,
      SUM(IF(DATEDIFF(DATE(?), DATE(gl.trans_date)) > 90, gl.credit_equiv - gl.debit_equiv, 0)) AS excess,
      SUM(gl.credit_equiv - gl.debit_equiv) AS total
    FROM creditor_group AS cg 
      JOIN ${source} AS gl ON gl.account_id = cg.account_id
    WHERE DATE(gl.trans_date) <= DATE(?)
    ${includeZeroes ? '' : havingNonZeroValues}
  `;

  return db.exec(creditorSql, dates)
    .then(creditors => {
      data.creditors = creditors;
      data.dateUntil = params.date;
      return db.exec(aggregateSql, dates);
    })
    .then(aggregates => {
      data.aggregates = aggregates[0];
      return data;
    });
}

exports.context = queryContext;
exports.aged = agedCreditorReport;
