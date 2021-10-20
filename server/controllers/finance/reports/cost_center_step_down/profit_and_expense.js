const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');
const currencies = require('../../currencies');

const TEMPLATE_ACCOUNTS = './server/controllers/finance/reports/cost_center_step_down/profit_and_expense.handlebars';

// expose to the API
exports.report = profitAndExpenseReport;

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

  const queryTotals = `
    SELECT
      z.label, 
      SUM(z.profit * IFNULL(GetExchangeRate(?, ?, ?), 1)) profit, 
      SUM(z.expense * IFNULL(GetExchangeRate(?, ?, ?), 1)) expense, 
      SUM((z.profit - expense) * IFNULL(GetExchangeRate(?, ?, ?), 1)) AS balance
    FROM
    (
      SELECT cc.label, 0 AS profit, SUM(gl.debit_equiv - gl.credit_equiv) expense, gl.cost_center_id AS ccId
      FROM general_ledger gl 
      JOIN cost_center cc ON cc.id = gl.cost_center_id
      JOIN account a ON a.id = gl.account_id 
      WHERE gl.period_id >= ? AND gl.period_id <= ? AND a.type_id = 5
      GROUP BY cc.id
      UNION ALL 
      SELECT cc.label, SUM(gl.credit_equiv - gl.debit_equiv) profit, 0 AS expense, gl.cost_center_id AS ccId
      FROM general_ledger gl 
      JOIN cost_center cc ON cc.id = gl.cost_center_id
      JOIN account a ON a.id = gl.account_id 
      WHERE gl.period_id >= ? AND gl.period_id <= ? AND a.type_id = 4
      GROUP BY cc.id
    )z
  `;

  const query = `
    ${queryTotals} GROUP BY z.ccId ORDER BY z.label;
  `;

  const getExchangeRateParams = [enterpriseId, options.currency_id, dateTo];
  const glQueryParams = [options.periodFrom, options.periodTo];

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

function profitAndExpenseReport(req, res, next) {
  buildAccountsReport(req.query, req.session)
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}
