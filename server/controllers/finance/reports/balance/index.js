/**
 * Balance Controller
 *
 * This controller is responsible for processing the balance report.
 *
 * @module finance/balance
 *
 * @requires lodash
 * @requires lib/db
 * @requires lib/ReportManager
 * @requires lib/errors/BadRequest
 */

const _ = require('lodash');
const db = require('../../../../lib/db');
const Tree = require('../../../../lib/Tree');
const ReportManager = require('../../../../lib/ReportManager');

// report template
const TEMPLATE = './server/controllers/finance/reports/balance/report.handlebars';

// expose to the API
exports.document = document;

// default report parameters
const DEFAULT_PARAMS = {
  csvKey : 'accounts',
  filename : 'TREE.BALANCE',
  orientation : 'landscape',
  footerRight : '[page] / [toPage]',
};

const TITLE_ID = 6;

/**
 * @function document
 *
 * @description
 * This function renders the Balance report.  The balance report provides a view
 * of the balances of any account used during the period.
 */
function document(req, res, next) {
  const params = req.query;
  const context = {};
  let report;

  _.defaults(params, DEFAULT_PARAMS);

  context.useSeparateDebitsAndCredits = Number.parseInt(params.useSeparateDebitsAndCredits, 10);
  context.shouldPruneEmptyRows = Number.parseInt(params.shouldPruneEmptyRows, 10);
  context.shouldHideTitleAccounts = Number.parseInt(params.shouldHideTitleAccounts, 10);

  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    next(e);
    return;
  }

  getBalanceSummary(params.period_id, req.session.enterprise.currency_id, context.shouldPruneEmptyRows)
    .then(data => {
      if (context.shouldHideTitleAccounts) {
        data.accounts = data.accounts.filter(account => account.isTitleAccount === 0);
      }
      _.merge(context, data);
      return report.render(context);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

/**
 * @function getBalanceSummary(periodId, currencyId)
 *
 * @description
 * Returns the balance of the accounts for a given period.
 *
 * TODO(@jniles) - use the currencyId to get an exchange rate.
 *
 */
function getBalanceSummary(periodId, currencyId, shouldPrune) {
  const getFiscalYearSQL = `
    SELECT id, start_date, end_date, fiscal_year_id FROM period WHERE id = ?
  `;

  const sql = `
    SELECT a.id, a.number, a.label, a.type_id, a.label, a.parent,
      a.type_id = ${TITLE_ID} AS isTitleAccount,
      IFNULL(s.before, 0) AS "before",
      IFNULL(s.before_debit, 0) AS "before_debit",
      IFNULL(s.before_credit, 0) AS "before_credit",
      IFNULL(s.during, 0) AS "during",
      IFNULL(s.during_debit, 0) AS "during_debit",
      IFNULL(s.during_credit, 0) AS "during_credit",
      IFNULL(s.after, 0) AS "after",
      IFNULL(s.after_debit, 0) AS "after_debit",
      IFNULL(s.after_credit, 0) AS "after_credit",
      ? AS currencyId
    FROM account AS a LEFT JOIN (
      SELECT pt.account_id,
        IF(pt.period_id < ?, SUM(pt.debit - pt.credit), 0) AS "before",
        IF(pt.period_id < ?, SUM(pt.debit), 0) AS "before_debit",
        IF(pt.period_id < ?, SUM(pt.credit), 0) AS "before_credit",
        IF(pt.period_id = ?, SUM(pt.debit - pt.credit), 0) AS "during",
        IF(pt.period_id = ?, SUM(pt.debit), 0) AS "during_debit",
        IF(pt.period_id = ?, SUM(pt.credit), 0) AS "during_credit",
        IF(pt.period_id <= ?, SUM(pt.debit - pt.credit), 0) AS "after",
        IF(pt.period_id <= ?, SUM(pt.debit), 0) AS "after_debit",
        IF(pt.period_id <= ?, SUM(pt.credit), 0) AS "after_credit"
      FROM period_total AS pt
      WHERE pt.fiscal_year_id = ?
      GROUP BY pt.account_id
    )s ON a.id = s.account_id
    ORDER BY a.number;
  `;

  const context = {};

  // if the after result is 0, that means no movements occurred
  const isEmptyRow = (row) => row.after === 0;

  return db.one(getFiscalYearSQL, [periodId])
    .then(period => {
      const params = _.fill(Array(9), period.id);
      _.merge(context, { period });
      return db.exec(sql, [currencyId, ...params, period.fiscal_year_id]);
    })
    .then(accounts => {
      const tree = new Tree(accounts);

      // compute the values of the title accounts as the values of their children
      // takes O(n * m) time, where n is the number of nodes and m is the number
      // of periods
      const balanceKeys = [
        'before', 'before_debit', 'before_credit',
        'during', 'during_debit', 'during_credit',
        'after', 'after_debit', 'after_credit',
      ];
      const bulkSumFn = (currentNode, parentNode) => {
        balanceKeys.forEach(key => {
          parentNode[key] = (parentNode[key] || 0) + currentNode[key];
        });
      };

      // specify debit and credit, make credit absolute
      const makeBalanceKeysAbs = (currentNode) => {
        balanceKeys.forEach(key => {
          const amount = _.clone(currentNode[key]);
          if (amount > 0) {
            currentNode[key] = { debit : amount, amount };
          }
          if (amount < 0) {
            currentNode[key] = { credit : Math.abs(amount), amount };
          }
        });
      };

      // sum the debits and credits
      tree.walk(bulkSumFn, false);

      // label depths
      tree.walk(Tree.common.computeNodeDepth);
      // prune empty rows if needed
      if (shouldPrune) {
        tree.prune(isEmptyRow);
      }

      const root = tree.getRootNode();

      tree.walk(makeBalanceKeysAbs, false);
      const balances = tree.toArray();
      const totals = {
        before : root.before,
        before_debit : root.before_debit,
        before_credit : root.before_credit,
        during : root.during,
        during_debit : root.during_debit,
        during_credit : root.during_credit,
        after : root.after,
        after_debit : root.after_debit,
        after_credit : root.after_credit,
        currencyId,
      };

      _.merge(context, { accounts : balances, totals });
      return context;
    });
}
