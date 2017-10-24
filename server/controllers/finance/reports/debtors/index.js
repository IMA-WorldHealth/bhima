/**
 * @overview finance/reports/debtors/index.js
 *
 * @description
 * This report displays the amounts owed by debtor groups broken down by age of
 * their debt.  The report highlights clients who have long overdue debts, so
 * that the administration can send out a recovery service to try and recover
 * the owed debt.
 *
 * The typical age categories are 0-30 days, 30-60 days, 60-90 days, and > 90
 * days.
 *
 * As usual, the reports are created with a handlebars template and shipped to
 * the client as either JSON, HTML, or PDF, depending on the renderer specified
 * in the HTTP query string.
 */


const _ = require('lodash');
const ReportManager = require('../../../../lib/ReportManager');
const db = require('../../../../lib/db');

// path to the template to render
const TEMPLATE = './server/controllers/finance/reports/debtors/aged.handlebars';

/**
 * @method agedDebtorReport
 *
 * @description
 * The HTTP interface which actually creates the report.
 */
function agedDebtorReport(req, res, next) {
  const qs = _.extend(req.query, { csvKey : 'debtors' });
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
  const debtorSql = `
    SELECT BUID(dg.uuid) AS id, dg.name, a.number,
      SUM(IF(DATEDIFF(DATE(?), DATE(gl.trans_date)) BETWEEN 0 AND 29, gl.debit_equiv - gl.credit_equiv, 0)) AS thirty,
      SUM(IF(DATEDIFF(DATE(?), DATE(gl.trans_date)) BETWEEN 30 AND 59, gl.debit_equiv - gl.credit_equiv, 0)) AS sixty,
      SUM(IF(DATEDIFF(DATE(?), DATE(gl.trans_date)) BETWEEN 60 AND 89, gl.debit_equiv - gl.credit_equiv, 0)) AS ninety,
      SUM(IF(DATEDIFF(DATE(?), DATE(gl.trans_date)) > 90, gl.debit_equiv - gl.credit_equiv, 0)) AS excess,
      SUM(gl.debit_equiv - gl.credit_equiv) AS total
    FROM debtor_group AS dg JOIN debtor AS d ON dg.uuid = d.group_uuid
      LEFT JOIN ${source} AS gl ON gl.entity_uuid = d.uuid
      JOIN account AS a ON a.id = dg.account_id
    WHERE DATE(gl.trans_date) <= DATE(?)
    GROUP BY dg.uuid
    ${includeZeroes ? '' : havingNonZeroValues}
    ORDER BY dg.name;
  `;

  // aggregates the data above as totals into columns of 30, 60, 90, and >90
  const aggregateSql = `
    SELECT
      SUM(IF(DATEDIFF(DATE(?), DATE(gl.trans_date)) BETWEEN 0 AND 29, gl.debit_equiv - gl.credit_equiv, 0)) AS thirty,
      SUM(IF(DATEDIFF(DATE(?), DATE(gl.trans_date)) BETWEEN 30 AND 59, gl.debit_equiv - gl.credit_equiv, 0)) AS sixty,
      SUM(IF(DATEDIFF(DATE(?), DATE(gl.trans_date)) BETWEEN 60 AND 89, gl.debit_equiv - gl.credit_equiv, 0)) AS ninety,
      SUM(IF(DATEDIFF(DATE(?), DATE(gl.trans_date)) > 90, gl.debit_equiv - gl.credit_equiv, 0)) AS excess,
      SUM(gl.debit_equiv - gl.credit_equiv) AS total
    FROM debtor_group AS dg JOIN debtor AS d ON dg.uuid = d.group_uuid
      LEFT JOIN ${source} AS gl ON gl.entity_uuid = d.uuid
    WHERE DATE(gl.trans_date) <= DATE(?)
    ${includeZeroes ? '' : havingNonZeroValues}
  `;

  return db.exec(debtorSql, dates)
    .then(debtors => {
      data.debtors = debtors;
      data.dateUntil = params.date;
      return db.exec(aggregateSql, dates);
    })
    .then(aggregates => {
      data.aggregates = aggregates[0];
      return data;
    });
}

exports.context = queryContext;
exports.aged = agedDebtorReport;
exports.open = require('./openDebtors').report;
