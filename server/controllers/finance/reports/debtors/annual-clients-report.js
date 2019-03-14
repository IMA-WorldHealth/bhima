const _ = require('lodash');

const ReportManager = require('../../../../lib/ReportManager');
const db = require('../../../../lib/db');
const Fiscal = require('../../fiscal');
const Exchange = require('../../exchange');

// path to the template to render
const TEMPLATE = './server/controllers/finance/reports/debtors/annual-clients-report.handlebars';

exports.annualClientsReport = annualClientsReport;

/**
 * @method annualClientsReport
 *
 * @description
 * The HTTP interface which actually creates the report.
 */
function annualClientsReport(req, res, next) {
  const options = _.extend(req.query, {
    filename : 'REPORT.CLIENTS.TITLE',
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
  const { currencyId, hideLockedClients } = req.query;

  // convert to an integer
  const shouldHideLockedClients = Number(hideLockedClients);

  const data = {
    isEnterpriseCurrency : parseInt(currencyId, 10) === req.session.enterprise.currency_id,
  };

  return Promise.all([
    Fiscal.lookupFiscalYear(fiscalYearId),
    Exchange.getExchangeRate(req.session.enterprise.id, currencyId, new Date()),
  ])
    .then(([fiscalYear, exchange]) => {
      const rate = exchange.rate || 1;
      _.extend(data, { fiscalYear, rate });

      return Promise.all([
        getDebtorGroupMovements(fiscalYearId, currencyId, rate, shouldHideLockedClients),
        getTotalsFooter(fiscalYearId, currencyId, rate, shouldHideLockedClients),
      ]);
    })
    .then(([rows, footer]) => {
      _.extend(data, { rows, footer });
      return report.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}

/**
 * @method getDebtorGroupMovements
 *
 * @description
 * This method takes the fiscal year's id and retrieves the balance of all
 * debtor group's accounts.  The currency and exchange rate are used to convert
 * the values into the correct currency rendering.
 */
function getDebtorGroupMovements(fiscalYearId, currencyId, rate, hideLockedClients = 0) {
  const hiddenClientsCondition = ' AND dg.locked = 0 ';
  const sql = `
    SELECT ac.number AS accountNumber, dg.name AS groupName,
      IFNULL(SUM(IF(p.number = 0, pt.debit - pt.credit, 0)), 0) * ${rate} AS openingBalance,
      IFNULL(SUM(IF(p.number > 0, pt.debit, 0)), 0) * ${rate} AS debit,
      IFNULL(SUM(IF(p.number > 0, pt.credit, 0)), 0) * ${rate} AS credit,
      IFNULL(SUM(IF(p.number > 0, pt.debit - pt.credit, 0)), 0) * ${rate} AS movement,
      IFNULL(SUM(pt.debit - pt.credit), 0) * ${rate} AS closingBalance,
      ${currencyId} as currencyId
    FROM debtor_group dg
      LEFT JOIN period_total pt ON dg.account_id = pt.account_id
      LEFT JOIN account ac ON ac.id = pt.account_id
      LEFT JOIN period p ON p.id = pt.period_id
    WHERE pt.fiscal_year_id = ? ${hideLockedClients ? hiddenClientsCondition : ''}
    GROUP BY pt.account_id;
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
function getTotalsFooter(fiscalYearId, currencyId, rate, hideLockedClients = 0) {
  const hiddenClientsCondition = ' AND dg.locked = 0 ';
  const sql = `
    SELECT ac.number AS accountNumber, ac.label AS accountLabel,
      IFNULL(SUM(IF(p.number = 0, pt.debit - pt.credit, 0)), 0) * ${rate} AS openingBalance,
      IFNULL(SUM(IF(p.number > 0, pt.debit, 0)), 0) * ${rate} AS debit,
      IFNULL(SUM(IF(p.number > 0, pt.credit, 0)), 0) * ${rate} AS credit,
      IFNULL(SUM(IF(p.number > 0, pt.debit - pt.credit, 0)), 0) * ${rate} AS movement,
      IFNULL(SUM(pt.debit - pt.credit), 0) * ${rate} AS closingBalance,
      ${currencyId} as currencyId
    FROM debtor_group dg
      LEFT JOIN period_total pt ON dg.account_id = pt.account_id
      LEFT JOIN account ac ON ac.id = pt.account_id
      LEFT JOIN period p ON p.id = pt.period_id
    WHERE pt.fiscal_year_id = ? ${hideLockedClients ? hiddenClientsCondition : ''};
  `;

  return db.one(sql, fiscalYearId);
}
