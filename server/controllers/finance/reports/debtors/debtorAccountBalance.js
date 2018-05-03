const _ = require('lodash');
const q = require('q');

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
  const fiscalYearId = req.query.fiscalId;

  return q.all([
    fiscalYearQuery(fiscalYearId),
    getDebtorGroupMovements(fiscalYearId),
    getTotalsFooter(fiscalYearId),
  ])
    .spread((fiscalYear, rows, footer) => {
      return report.render({ fiscalYear, rows, footer });
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

/**
 * @method getDebtorGroupMovements
 *
 * @description
 * This method takes the fiscal year's id and retrieves the balance of all
 * debtor group's accounts.
 */
function getDebtorGroupMovements(fiscalYearId) {
  const sql = `
    SELECT ac.number AS accountNumber, dg.name AS groupName,
      SUM(pt.debit) AS debit, SUM(pt.credit) AS credit,
      IFNULL(SUM(IF(p.number = 0, pt.debit - pt.credit, 0)), 0) AS openingBalance,
      IFNULL(SUM(IF(p.number > 0, pt.debit - pt.credit, 0)), 0) AS movement,
      IFNULL(SUM(pt.debit - pt.credit), 0) AS closingBalance
    FROM debtor_group dg
      LEFT JOIN period_total pt ON dg.account_id = pt.account_id
      LEFT JOIN account ac ON ac.id = pt.account_id
      LEFT JOIN period p ON p.id = pt.period_id
    WHERE pt.fiscal_year_id = ?
    GROUP BY pt.account_id
  `;

  return db.exec(sql, fiscalYearId);
}

/**
 * @method getTotalsFooter
 *
 * @description
 * This function computes the sum of all the values from the table of debtors
 * groups.
 */
function getTotalsFooter(fiscalYearId) {
  const sql = `
    SELECT ac.number AS accountNumber, ac.label AS accountLabel,
      SUM(pt.debit) AS debit, SUM(pt.credit) AS credit,
      IFNULL(SUM(IF(p.number = 0, pt.debit - pt.credit, 0)), 0) AS openingBalance,
      IFNULL(SUM(IF(p.number > 0, pt.debit - pt.credit, 0)), 0) AS movement,
      IFNULL(SUM(pt.debit - pt.credit), 0) AS closingBalance
    FROM debtor_group dg
      LEFT JOIN period_total pt ON dg.account_id = pt.account_id
      LEFT JOIN account ac ON ac.id = pt.account_id
      LEFT JOIN period p ON p.id = pt.period_id
    WHERE pt.fiscal_year_id = ?
  `;

  return db.one(sql, fiscalYearId);
}

function fiscalYearQuery(id) {
  const sql = 'SELECT label FROM fiscal_year WHERE id = ?';
  return db.one(sql, id);
}
