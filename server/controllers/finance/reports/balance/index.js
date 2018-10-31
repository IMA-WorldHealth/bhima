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
 *
 * TODO(@jniles): Finish the currency conversion part of this report.
 *
 * NOTE(@jniles): This file corresponds to the "Balance Report" on the client.
 */
function document(req, res, next) {
  const params = req.query;
  const context = {};
  let report;

  _.defaults(params, DEFAULT_PARAMS);

  context.useSeparateDebitsAndCredits = Number.parseInt(params.useSeparateDebitsAndCredits, 10);
  context.shouldPruneEmptyRows = Number.parseInt(params.shouldPruneEmptyRows, 10);
  context.shouldHideTitleAccounts = Number.parseInt(params.shouldHideTitleAccounts, 10);
  context.includeClosingBalances = Number.parseInt(params.includeClosingBalances, 10);

  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    next(e);
    return;
  }

  const currencyId = req.session.enterprise.currency_id;

  getPeriodFromParams(params.fiscal_id, params.period_id, context.includeClosingBalances)
    .then(period => {
      _.merge(context, { period });
      return getBalanceForFiscalYear(period, currencyId);
    })
    .then(({ accounts, totals }) => {
      _.merge(context, { accounts, totals });
      return computeBalanceTree(accounts, totals, context, context.shouldPruneEmptyRows);
    })
    .then(({ accounts, totals }) => {
      _.merge(context, { accounts, totals });

      if (context.shouldHideTitleAccounts) {
        context.accounts = accounts.filter(account => account.isTitleAccount === 0);
      }

      return report.render(context);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}

/**
 * @function getPeriodFromParams
 *
 * @description
 * This normalizes the options of fiscal year, period id, and including closing
 * balances to make them all return the same kind of value - a period object.
 * If the user chooses to include the closing balances, it goes all the way to
 * the closing period, otherwise, it limits itself to the period chosen.
 */
function getPeriodFromParams(fiscalYearId, periodId, includeClosingBalances = false) {
  const sql = `
    SELECT p.id, p.start_date, p.end_date, p.fiscal_year_id, p.number,
      fy.start_date AS fiscalYearStart, fy.end_date AS fiscalYearEnd
    FROM period p JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
  `;

  // if we should include the closing balances, go all the way to the closing period
  if (includeClosingBalances) {
    return db.one('SELECT MAX(period.number) as number FROM period WHERE fiscal_year_id = ?', fiscalYearId)
      .then(closingPeriod => {
        const query = `${sql} WHERE fy.id = ? AND p.number = ?;`;
        return db.one(query, [fiscalYearId, closingPeriod.number]);
      });
  }

  const query = `${sql} WHERE p.id = ?;`;
  return db.one(query, periodId);
}

/**
 * @function getBalanceForFiscalYear
 *
 * @description
 * This function constructs the period totals for part of a fiscal year.  It
 * only tracks the progress up to a period, and does not consider the close of
 * the fiscal year.
 *
 * @param {Number} periodId - the period id of the period to stop at
 * @param {Number} currencyId - the currencyId to render
 */
async function getBalanceForFiscalYear(period, currencyId) {
  const sql = `
    SELECT a.id, a.number, a.label, a.type_id, a.label, a.parent,
      a.type_id = ${TITLE_ID} AS isTitleAccount,
      IFNULL(s.before, 0) AS "before",
      IF(s.before > 0, s.before, 0) before_debit,
      IF(s.before < 0, ABS(s.before), 0) before_credit,
      IFNULL(s.during, 0) AS "during",
      IFNULL(s.during_debit, 0) AS "during_debit",
      IFNULL(s.during_credit, 0) AS "during_credit",
      IFNULL(s.after, 0) AS "after",
      IF(s.after > 0, s.after, 0) after_debit,
      IF(s.after < 0, ABS(s.after), 0) after_credit,
      ? AS currencyId
    FROM account AS a LEFT JOIN (
      SELECT pt.account_id,
        SUM(IF(p.number = 0, pt.debit - pt.credit, 0)) AS "before",
        SUM(IF(p.number BETWEEN 1 AND ?, pt.debit - pt.credit, 0)) AS "during",
        SUM(IF(p.number BETWEEN 1 AND ?, pt.debit, 0)) AS "during_debit",
        SUM(IF(p.number BETWEEN 1 AND ?, pt.credit, 0)) AS "during_credit",
        SUM(IF(p.number <= ?, pt.debit - pt.credit, 0)) AS "after"
      FROM period_total AS pt
        JOIN period p ON pt.period_id = p.id
      WHERE pt.fiscal_year_id = ? AND p.fiscal_year_id = ?
      GROUP BY pt.account_id
    )s ON a.id = s.account_id
    ORDER BY a.number;
  `;

  const aggregateSQL = `
    SELECT
      SUM(IF(s.before > 0, s.before, 0)) before_debit,
      SUM(IF(s.before < 0, ABS(s.before), 0)) before_credit,
      SUM(during_debit) during_debit,
      SUM(during_credit) during_credit,
      SUM(IF(s.after > 0, s.after, 0)) after_debit,
      SUM(IF(s.after < 0, ABS(s.after), 0)) after_credit
    FROM (
      SELECT
        SUM(IF(p.number = 0, pt.debit - pt.credit, 0)) AS "before",
        SUM(IF(p.number BETWEEN 1 AND ?, pt.debit - pt.credit, 0)) AS "during",
        SUM(IF(p.number BETWEEN 1 AND ?, IF(pt.debit > pt.credit, pt.debit - pt.credit, 0), 0)) AS "during_debit",
        SUM(IF(p.number BETWEEN 1 AND ?, IF(pt.debit < pt.credit, pt.credit - pt.debit, 0), 0)) AS "during_credit",
        SUM(IF(p.number <= ?, pt.debit - pt.credit, 0)) AS "after"
      FROM period_total AS pt
        JOIN period p ON pt.period_id = p.id
      WHERE pt.fiscal_year_id = ? AND p.fiscal_year_id = ?
      GROUP BY pt.account_id
    )s;
  `;

  const params = _.fill(Array(4), period.number);

  const [accounts, totals] = await Promise.all([
    db.exec(sql, [currencyId, ...params, period.fiscal_year_id, period.fiscal_year_id]),
    db.one(aggregateSQL, [...params, period.fiscal_year_id, period.fiscal_year_id]),
  ]);

  _.merge(totals, { currencyId });

  return { accounts, totals };
}

/**
 * @function computeBalanceTree
 *
 * @description
 * This function creates a tree for summing balances for each account.
 */
function computeBalanceTree(accounts, totals, context, shouldPrune) {
  // if the after result is 0, that means no movements occurred
  const isEmptyRow = (row) => (
    row.before === 0
    && row.during === 0
    && row.after === 0
  );

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

  // sum the debits and credits
  tree.walk(bulkSumFn, false);

  // label depths
  tree.walk(Tree.common.computeNodeDepth);

  // prune empty rows if needed
  if (shouldPrune) {
    tree.prune(isEmptyRow);
  }

  const balances = tree.toArray();

  // FIXME(@jniles) - figure out how to migrate this to SQL
  totals.during_debit = 0;
  totals.during_credit = 0;
  balances.forEach(account => {
    if (!account.isTitleAccount) {
      totals.during_debit += account.during_debit;
      totals.during_credit += account.during_credit;
    }
  });

  return { accounts : balances, totals };
}
