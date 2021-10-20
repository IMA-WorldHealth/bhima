const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');
const currencies = require('../../currencies');

const TEMPLATE_ACCOUNTS = './server/controllers/finance/reports/cost_center_step_down/accounts_report.handlebars';

// expose to the API
exports.report = costCenterByAccountsReport;

/**
 * @function reporting
 *
 * @description
 * Renders the cost center value by accounts report
 *
 * @param {*} options the report options
 * @param {*} session the session
 */
async function buildAccountsReport(params, session) {
  const options = _.extend(params, {
    filename : 'TREE.COST_CENTER_STEPDOWN',
    csvKey : 'rows',
    user : session.user,
  });

  const report = new ReportManager(TEMPLATE_ACCOUNTS, session, options);

  // Account type 4 for income and 5 for expense
  const accountTypes = +options.include_revenue ? [4, 5] : [5];

  // get exchange information for multi currency report
  const exchangeInformation = await currencies.getExchangeInformationForReports(session, params);

  const {
    dateFrom,
    dateTo,
    enterpriseId,
    firstCurrency,
    secondCurrency,
    lastRateUsed,
  } = exchangeInformation;

  const costCenterDetails = await db.one('SELECT label FROM cost_center WHERE id = ?', [options.cost_center_id]);

  const queryTotals = `
    SELECT
      a.number,
      a.label,
      at.translation_key,
      z.label as cc_label,
      SUM(z.debit_equiv * IFNULL(GetExchangeRate(?, ?, ?), 1)) debit,
      SUM(z.credit_equiv * IFNULL(GetExchangeRate(?, ?, ?), 1)) credit,
      SUM((z.debit_equiv - z.credit_equiv) * IFNULL(GetExchangeRate(?, ?, ?), 1)) solde
    FROM account a 
    JOIN account_type at ON at.id = a.type_id
    JOIN (
      SELECT cc.label, gl.debit_equiv , gl.credit_equiv , gl.principal_center_id AS ccId, gl.account_id 
      FROM general_ledger gl 
      JOIN account a ON a.id = gl.account_id 
      JOIN cost_center cc ON cc.id = gl.principal_center_id
      WHERE (gl.period_id >= ? AND gl.period_id <= ?) AND a.type_id IN (?)
        AND gl.principal_center_id = ?
      UNION ALL
      SELECT cc.label, gl.debit_equiv , gl.credit_equiv , gl.cost_center_id AS ccId, gl.account_id 
      FROM general_ledger gl 
      JOIN cost_center cc ON cc.id = gl.cost_center_id AND gl.principal_center_id IS NULL 
      JOIN account a ON a.id = gl.account_id 
      WHERE (gl.period_id >= ? AND gl.period_id <= ?) AND a.type_id IN (?)
        AND gl.cost_center_id = ?
    )z on z.account_id = a.id 
`;

  const query = `
    ${queryTotals} GROUP BY z.ccId, a.id ORDER BY a.number;
  `;

  const getExchangeRateParams = [enterpriseId, options.currency_id, dateTo];
  const glQueryParams = [options.periodFrom, options.periodTo, accountTypes, options.cost_center_id];

  const parameters = [
    ...getExchangeRateParams,
    ...getExchangeRateParams,
    ...getExchangeRateParams,
    ...glQueryParams,
    ...glQueryParams,
  ];

  const data = await db.exec(query, parameters);
  const totals = await db.exec(queryTotals, parameters);

  const context = {
    currencyId : options.currency_id,
    costCenterDetails,
    dateFrom,
    dateTo,
    data,
    totals,
    firstCurrency,
    secondCurrency,
    lastRateUsed,
  };

  return report.render(context);
}

function costCenterByAccountsReport(req, res, next) {
  buildAccountsReport(req.query, req.session)
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}
