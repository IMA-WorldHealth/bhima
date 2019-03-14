/**
 * @module finance/reports/cashReport
 *
 * @description
 * The Cash Report presents a colloquial view of receipts and expenses from
 * a cashbox.  A user is able to view the report in two templates:
 *   1. a combined view where all transactions are ordered by date
 *   2. a separated view that puts income and expense in two separate tables
 *
 * @requires lodash
 * @requires lib/db
 * @requires lib/ReportManager
 * @requires lib/errors/BadRequest
 * @requires finance/accounts/extra
 * @requires finance/accounts/transactions
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

const templates = {
  NORMAL : TEMPLATE_COMBINED,
  SPLIT : TEMPLATE_SEPARATED,
};


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
  params.account_id = Number(params.account_id);

  try {
    const TEMPLATE = templates[params.format] || templates.NORMAL;
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    next(e);
    return;
  }

  // set parameters so that they provide
  params.enterprise_id = req.session.enterprise.id;
  params.includeUnpostedValues = true;

  const context = {};

  // determine if we are showing the income and/or expense categories
  context.hasIncome = ['ENTRY_AND_EXIT', 'ENTRY'].includes(params.type);
  context.hasExpense = ['ENTRY_AND_EXIT', 'EXIT'].includes(params.type);
  context.hasBoth = context.hasIncome && context.hasExpense;

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
      return Promise.all([
        AccountTransactions.getAccountTransactions(params, header.balance),
        db.exec(`SELECT id, text FROM transaction_type;`),
      ]);
    })
    .then(([txns, transactionTypes]) => {
      _.merge(context, txns, {
        dateFrom : params.dateFrom,
        dateTo : params.dateTo,
      });

      // map the transaction types to each transaction by their ID
      const map = _.keyBy(transactionTypes, 'id');
      context.transactions.forEach(txn => {
        txn.transactionType = map[txn.transaction_type_id].text;
      });

      // if we have a split format, split along the lines of income and expense.
      if (params.format === 'SPLIT') {
        const income = txns.transactions.filter(txn => txn.debit > 0);
        const expense = txns.transactions.filter(txn => txn.credit > 0);
        _.merge(context, { income, expense });
      }

      return report.render(context);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}
