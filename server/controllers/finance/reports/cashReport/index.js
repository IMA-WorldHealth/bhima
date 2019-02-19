/**
 * cashReport Controller
 *
 *
 * This controller is responsible for processing cash report.
 *
 * @module finance/cashReport
 *
 * @requires lodash
 * @requires lib/db
 * @requires lib/ReportManager
 * @requires lib/errors/BadRequest
 */

const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');
const BadRequest = require('../../../../lib/errors/BadRequest');

const AccountExtras = require('../../accounts/extra');
const AccountTransactions = require('../../accounts/transactions');

const TEMPLATE_COMBINED = './server/controllers/finance/reports/cashReport/report_combined.handlebars';
const TEMPLATE_SEPARATED = './server/controllers/finance/reports/cashReport/report_separated.handlebars';

// expose to the API
exports.document = document;

/**
 * @function getCashboxByAccountId
 *
 * @description
 * Locates a cashbox infomration by
 *
 */
function getCashboxByAccountId(accountId) {
  const sql = `
    SELECT c.id, c.label, cu.symbol, c.is_auxiliary, cac.currency_id, cac.account_id
    FROM cash_box AS c
    JOIN cash_box_account_currency AS cac ON c.id = cac.cash_box_id
    JOIN currency AS cu ON cac.currency_id = cu.id
    WHERE cac.account_id = ?;
  `;

  return db.one(sql, [accountId]);
}


/**
 * @function document
 * @description process and render the cash report document
 */
function document(req, res, next) {
  const params = req.query;
  let report;

  if (!params.dateFrom || !params.dateTo) {
    throw new BadRequest('Date range should be specified', 'ERRORS.BAD_REQUEST');
  }

  if (!params.account_id) {
    throw new BadRequest('Account of cash box not specified', 'ERRORS.BAD_REQUEST');
  }

  if (!params.format) {
    throw new BadRequest('No report format provided', 'ERRORS.BAD_REQUEST');
  }

  params.user = req.session.user;
  params.format = Number(params.format);
  params.account_id = Number(params.account_id);

  try {
    const TEMPLATE = params.format === 1 ? TEMPLATE_COMBINED : TEMPLATE_SEPARATED;
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    next(e);
    return;
  }

  // set parameters so that they provide
  params.enterprise_id = req.session.enterprise.id;
  params.includeUnpostedValues = true;

  const context = {};

  getCashboxByAccountId(params.account_id)
    .then(cashbox => {
      _.merge(context, { cashbox });

      // determine the currency rendering
      params.currency_id = cashbox.currency_id;
      params.isEnterpriseCurrency = params.currency_id === req.session.enterprise.currency_id;

      // get the opening balance for the acount
      return AccountExtras.getOpeningBalanceForDate(cashbox.account_id, params.dateFrom);
    })
    .then(header => {
      _.merge(context, { header });
      // get the account's transactions
      return AccountTransactions.getAccountTransactions(params, header.balance);
    })
    .then((txns) => {
      _.merge(context, txns, {
        dateFrom : params.dateFrom,
        dateTo : params.dateTo,
      });

      return report.render(context);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}
