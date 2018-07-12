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
const INCOME_ID = 4;
const EXPENSE_ID = 5;

/**
 * @function document
 *
 * @description
 * This function renders the Balance report.  The balance report provides a view
 * of the balances of any account used during the period.
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
 * The idea is this:
 *  First column set must contain the opening balance of the fiscal year, no
 *  matter what.
 *  Second column set must contain the movements up to and including the
 *  selected month.
 *  Third contains the sum of all up to that month.
 *
 * TODO(@jniles) - use the currencyId to get an exchange rate.
 */
function getBalanceSummary(periodId, currencyId, shouldPrune) {
  const getFiscalYearSQL = `
    SELECT p.id, p.start_date, p.end_date, p.fiscal_year_id, p.number,
      fy.start_date AS fiscalYearStart, fy.end_date AS fiscalYearEnd
    FROM period p JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
    WHERE p.id = ?;
  `;

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
        JOIN account ac ON pt.account_id = ac.id
      WHERE pt.fiscal_year_id = ?
        AND ac.type_id NOT IN (${INCOME_ID}, ${EXPENSE_ID})
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
        JOIN account ac ON pt.account_id = ac.id
      WHERE pt.fiscal_year_id = ?
        AND ac.type_id NOT IN (${INCOME_ID}, ${EXPENSE_ID})
      GROUP BY pt.account_id
    )s;
  `;

  const context = {};

  // if the after result is 0, that means no movements occurred
  const isEmptyRow = (row) => (
    row.before === 0
    && row.during === 0
    && row.after === 0
  );

  return db.one(getFiscalYearSQL, [periodId])
    .then(period => {
      const params = _.fill(Array(4), period.number);
      _.merge(context, { period });
      return Promise.all([
        db.exec(sql, [currencyId, ...params, period.fiscal_year_id]),
        db.one(aggregateSQL, [...params, period.fiscal_year_id]),
      ]);
    })
    .then(([accounts, totals]) => {
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

      _.merge(totals, { currencyId });
      _.merge(context, { accounts : balances, totals });
      return context;
    });
}
