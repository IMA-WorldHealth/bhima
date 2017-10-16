const _ = require('lodash');
const ReportManager = require('../../../../lib/ReportManager');
const db = require('../../../../lib/db');

// path to the template to render
const TEMPLATE = './server/controllers/finance/reports/debtors/balance.handlebars';

exports.debtorAccountBalance = debtorAccountBalance;

/**
 * @method debtorAccountBalance
 *
 * @description
 * The HTTP interface which actually creates the report.
 */
function debtorAccountBalance(req, res, next) {
  const options = _.extend(req.query, {
    filename : 'REPORT.CLIENT_DEBTOR_ACCOUNT_BALANCE_REPORT',
    orientation : 'portrait',
    csvKey   : 'rows',
    footerRight : '[page] / [toPage]',
    footerFontSize : '7',
  });

  let report;

  try {
    report = new ReportManager(TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  // fire the SQL for the report
  const fiscalYearId = req.params.fiscalYearId;
  let _rows = [];

  queryContext(fiscalYearId)
  .then(function (data) {
    _rows = data;
    return fiscalYearQuery(fiscalYearId);
  })
  .then(function (fiscalYear) {
    return report.render(
      { rows : _rows, fiscalLabel : fiscalYear.label }
    );
  })
  .then(result => {
    res.set(result.headers).send(result.report);
  })
  .catch(next)
  .done();
}

/**
 * @method queryContext
 *
 * @param int fiscalYearId
 * this method takes the fiscal year's id and retreives
 * the balance of all clients debtor accounts
 * @description
 * The HTTP interface which actually creates the report.
 */
function queryContext(fiscalYearId) {

  const sql = `
    SELECT ac.id as account, ac.label as name, p.number as period,
      SUM(pt.debit) as debit, SUM(pt.credit) as credit,
      SUM(IF(p.number = 0, (pt.debit-pt.credit) ,0))  as openingBalance,
      SUM(IF((p.number >0 AND p.number<13), (pt.debit-pt.credit) ,0))  as movement,
      (SUM(IF(p.number <13, (pt.debit-pt.credit) ,0))) as closingBalance
    FROM  period_total  pt
    JOIN debtor_group d ON pt.account_id = d.account_id
    JOIN account ac  ON ac.id = pt.account_id
    JOIN fiscal_year f ON f.id = pt.fiscal_year_id
    JOIN period p ON p.id = pt.period_id
    WHERE pt.fiscal_year_id = ?
    GROUP BY pt.account_id
  `;
  return db.exec(sql, fiscalYearId);
}

function fiscalYearQuery(id) {
  const sql = `SELECT label FROM fiscal_year WHERE id =?`;
  return db.one(sql, id);
}
