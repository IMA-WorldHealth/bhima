const _ = require('lodash');

const ReportManager = require('../../../../lib/ReportManager');
const db = require('../../../../lib/db');
const Fiscal = require('../../fiscal');
const Exchange = require('../../exchange');

// path to the template to render
const TEMPLATE = './server/controllers/finance/reports/debtors/annual_clients_report.handlebars';

exports.annualClientsReport = annualClientsReport;
exports.reporting = reporting;

async function setupAnnualClientsReport(options, enterpriseCurrencyId) {
  const {
    fiscalId, currencyId, hideLockedClients, includeCashClients,
  } = options;

  // convert to an integer
  const shouldHideLockedClients = Number(hideLockedClients);
  const shouldIncludeCashClients = Number(includeCashClients);

  const isEnterpriseCurrency = parseInt(currencyId, 10) === enterpriseCurrencyId;

  const [fiscalYear, exchange] = await Promise.all([
    Fiscal.lookupFiscalYear(fiscalId),
    Exchange.getExchangeRate(enterpriseCurrencyId, currencyId, new Date()),
  ]);

  const rate = exchange.rate || 1;

  const [rows, footer] = await Promise.all([
    getDebtorGroupMovements(fiscalYear.id, currencyId, rate, shouldHideLockedClients, shouldIncludeCashClients),
    getTotalsFooter(fiscalYear.id, currencyId, rate, shouldHideLockedClients, shouldIncludeCashClients),
  ]);

  return {
    rows, footer, fiscalYear, rate, isEnterpriseCurrency,
  };
}

/**
 * @method annualClientsReport
 *
 * @description
 * The HTTP interface which actually creates the report.
 */
async function annualClientsReport(req, res, next) {
  const options = _.extend(req.query, {
    filename : 'REPORT.CLIENTS.TITLE',
    orientation : 'portrait',
    csvKey   : 'rows',
  });

  try {
    const reportManager = new ReportManager(TEMPLATE, req.session, options);
    const data = await setupAnnualClientsReport(req.query, req.session.enterprise.currency_id);
    const { headers, report } = await reportManager.render(data);
    res.set(headers).send(report);
  } catch (e) {
    next(e);
  }
}

/**
 * @description this function helps to get html(pdf) document of the report in server side
 * so that we can use it with others modules on the server side
 * @param {*} options the report options
 * @param {*} session the session
 */
async function reporting(options, session) {
  const params = _.extend({}, options, {
    filename : 'REPORT.CLIENTS.TITLE',
    orientation : 'portrait',
    csvKey   : 'rows',
  });

  const report = new ReportManager(TEMPLATE, session, params);
  const data = await setupAnnualClientsReport(params, session.enterprise.currency_id);
  return report.render(data);
}

/**
 * @method getDebtorGroupMovements
 *
 * @description
 * This method takes the fiscal year's id and retrieves the balance of all
 * debtor group's accounts.  The currency and exchange rate are used to convert
 * the values into the correct currency rendering.
 */
function getDebtorGroupMovements(fiscalYearId, currencyId, rate, hideLockedClients = 0, includeCashClients = 0) {
  const hiddenClientsCondition = ' AND dg.locked = 0 ';
  const excludeCashClientsCondition = 'AND dg.is_convention = 1 ';
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
    WHERE pt.fiscal_year_id = ?
      ${hideLockedClients ? hiddenClientsCondition : ''}
      ${includeCashClients ? '' : excludeCashClientsCondition}
    GROUP BY pt.account_id
    ORDER BY ac.number ASC, dg.name DESC;
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
function getTotalsFooter(fiscalYearId, currencyId, rate, hideLockedClients = 0, includeCashClients = 0) {
  const hiddenClientsCondition = ' AND dg.locked = 0 ';
  const excludeCashClientsCondition = 'AND dg.is_convention = 1 ';
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
    WHERE pt.fiscal_year_id = ?
      ${hideLockedClients ? hiddenClientsCondition : ''}
      ${includeCashClients ? '' : excludeCashClientsCondition}
  `;

  return db.one(sql, fiscalYearId);
}
