/**
 * Income Expense by Month Controller
 *
 * This controller is responsible for processing the income and expense by month
 * report.
 *
 * @requires lodash
 * @requires lib/db
 * @requires lib/ReportManager
 * @requires lib/errors/BadRequest
 * @requires @ima-worldhealth/tree
 * @requires controllers/fiscal
 */

const _ = require('lodash');
const Tree = require('@ima-worldhealth/tree');

const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');
const BadRequest = require('../../../../lib/errors/BadRequest');

const util = require('../../../../lib/util');
const Fiscal = require('../../fiscal');

const TEMPLATE = './server/controllers/finance/reports/income_expense_by_month/report.handlebars';

const INCOME_TYPE_ID = 4;
const EXPENSE_TYPE_ID = 5;
const TITLE_ID = 6;

const DEFAULT_PARAMS = {
  csvKey : 'rows',
  filename : 'TREE.INCOME_EXPENSE_BY_MONTH',
  orientation : 'landscape',
};

// expose to the API
exports.document = document;

function document(req, res, next) {
  let report;

  const options = _.defaults(req.query, DEFAULT_PARAMS);

  const removeUnusedAccounts = !!+options.removeUnusedAccounts;

  try {
    report = new ReportManager(TEMPLATE, req.session, options);
  } catch (e) {
    next(e);
    return;
  }

  const { periodId, periodNumber, fiscalYearId } = options;
  const data = {};

  const periodNum = parseInt(periodNumber, 10);
  const isOutOfRange = (periodNum - 2 <= 0);

  // TODO(@jniles) - gracefully change the number of columns if the user selects
  // a period too close to the start of the fiscal year.  For example, January
  // should default to a single column, February to two, etc.
  if (isOutOfRange) {
    next(new BadRequest(
      'Period selection is out of range.  Choose a period at least two months past the start of the fiscal year.',
      'ERRORS.BAD_DATE_INTERVAL',
    ));
    return;
  }

  Promise.all([
    getPeriodByNumberAndFiscalId(periodNum - 2, fiscalYearId),
    getPeriodByNumberAndFiscalId(periodNum - 1, fiscalYearId),
    getPeriodById(periodId),
    Fiscal.lookupFiscalYear(fiscalYearId),
  ])
    .then(([firstPeriod, secondPeriod, thirdPeriod, fiscalYear]) => {
      if (!firstPeriod.id || !thirdPeriod.id) {
        throw new BadRequest('The date range is invalid.');
      }

      _.extend(data, {
        firstPeriod, secondPeriod, thirdPeriod, fiscalYear,
      });

      return Promise.all([
        getAccountBalances(fiscalYear.id, firstPeriod.id),
        getAccountBalances(fiscalYear.id, secondPeriod.id),
        getAccountBalances(fiscalYear.id, thirdPeriod.id),
      ]);
    })
    .then(([firstBalances, secondBalances, thirdBalances]) => {

      const dataset = combineIntoSingleDataset(secondBalances, firstBalances, thirdBalances);
      const tree = constructAndPruneTree(dataset, removeUnusedAccounts);

      const root = tree.getRootNode();
      root.children = root.children || [];
      const rootChildrenFirst = root.children[0] || {};
      const isIncomeFirstElement = rootChildrenFirst.isIncomeAccount;

      let income = {};
      let expense = {};
      if (isIncomeFirstElement) {
        [income, expense] = root.children;
      } else {
        [expense, income] = root.children;
      }

      const profits = [];
      const losses = [];

      tree.walk(node => profits.push(node), true, income);
      tree.walk(node => losses.push(node), true, expense);

      // calculate totals and profit
      const emptyTotal = { balance : 0, firstBalance : 0, thirdBalance : 0 };
      const totals = {
        income :  profits[0] || emptyTotal,
        expense : losses[0] || emptyTotal,
      };

      // compute the differences, keeping the same variable names as before.
      // income is negative, so we add the income + expense to get the balance
      totals.difference = {
        firstBalance : totals.income.firstBalance + totals.expense.firstBalance,
        balance : totals.income.balance + totals.expense.balance,
        thirdBalance : totals.income.thirdBalance + totals.expense.thirdBalance,
      };

      _.extend(data, {
        profits, losses, totals,
      });

      return report.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}

/**
 * @function getAccountBalances
 *
 */
function getAccountBalances(fiscalYearId, periodId) {
  const sql = `
    SELECT a.id, a.number, a.label, a.type_id, a.label, a.parent,
      a.type_id = ${TITLE_ID} AS isTitleAccount, balance
    FROM account AS a LEFT JOIN (
      SELECT pt.account_id, SUM(pt.debit - pt.credit) AS balance
      FROM period_total AS pt
      JOIN period AS p ON p.id = pt.period_id
      WHERE pt.fiscal_year_id = ?
        AND p.id = ?
      GROUP BY pt.account_id
    )s ON a.id = s.account_id
    WHERE a.type_id IN (?)
    ORDER BY a.number;
  `;

  const accountTypes = [
    TITLE_ID,
    INCOME_TYPE_ID,
    EXPENSE_TYPE_ID,
  ];

  const params = [fiscalYearId, periodId, accountTypes];
  return db.exec(sql, params);
}

/**
 * @function getPeriodById
 *
 * @description
 * Small helper to get all properties of a period by its id.
 */
function getPeriodById(id) {
  const sql = `
    SELECT id, number, start_date, end_date, locked FROM period WHERE id = ?;
  `;

  return db.one(sql, id);
}

/**
 * @function combineIntoSingleDataset
 *
 * @description
 * This function takes two partially overlapping datasets and combines them into
 * a single dataset.  The current balances set the balance values and the
 * previous balances are assigned to firstBalance property.  Missing data is
 * filled in with zeroes.
 *
 * @returns Array
 */
function combineIntoSingleDataset(secondBalances, firstBalances, thirdBalances) {
  // make an id -> account map for both values
  const secondMap = new Map(secondBalances.map(a => [a.id, a]));
  const firstMap = new Map(firstBalances.map(a => [a.id, a]));
  const thirdMap = new Map(thirdBalances.map(a => [a.id, a]));

  // get all account ids in a single list.
  const combined = _.uniq([...secondMap.keys(), ...firstMap.keys(), ...thirdMap.keys()]);

  return combined.map(id => {
    const record = {};

    const second = secondMap.get(id);
    const first = firstMap.get(id);
    const third = thirdMap.get(id);

    if (second) {
      const firstBalance = first ? first.balance : 0;
      const thirdBalance = third ? third.balance : 0;
      _.extend(record, second, { firstBalance, thirdBalance });
    } else if (first) {
      const thirdBalance = third ? third.balance : 0;
      _.extend(record, first, { balance : 0 }, { firstBalance : first.balance, thirdBalance });
    } else {
      _.extend(record, third, { balance : 0, firstBalance : 0 }, { thirdBalance : third.balance });
    }

    return record;
  });
}

/**
 * @function getPeriodByNumberAndFiscalId
 *
 * @description
 * Small helper to get all properties of a period by its number.
 */
function getPeriodByNumberAndFiscalId(number, fiscalId) {
  const sql = `
    SELECT id, number, start_date, end_date, locked FROM period WHERE number = ? AND fiscal_year_id = ?;
  `;

  return db.one(sql, [number, fiscalId]);
}

/**
 * @function constructAndPruneTree
 *
 * @description
 * Receives a dataset of balances and creates the account tree.
 */
function constructAndPruneTree(dataset, removeUnusedAccounts = true) {
  const tree = new Tree(dataset);

  const properties = [
    'balance', 'firstBalance', 'thirdBalance',
  ];

  const bulkSumFn = (currentNode, parentNode) => {
    properties.forEach(key => {
      parentNode[key] = (parentNode[key] || 0) + currentNode[key];
    });
  };

  // sum the values in the tree
  tree.walk(bulkSumFn, false);

  // prune tree until all unused unused leaves fall off.
  pruneTree(tree, removeUnusedAccounts);

  // label income/expense branches
  tree.walk((node, parentNode) => {
    parentNode.isIncomeAccount = (node.isIncomeAccount || node.type_id === INCOME_TYPE_ID);
    parentNode.isExpenseAccount = (node.isExpenseAccount || node.type_id === EXPENSE_TYPE_ID);
  }, false);

  // label depths of nodes
  tree.walk(Tree.common.computeNodeDepth);
  tree.walk(calculateAverageBalance);
  return tree;
}

// the average balance for the three periods
function calculateAverageBalance(node) {
  node.averageBalance = util.roundDecimal((node.firstBalance + node.balance + node.thirdBalance) / 3, 2);
}

const MAX_ITERATIONS = 25;

/**
 * @function PruneTree
 *
 * @description
 * Prunes the tree until there are no more values to remove.
 */
function pruneTree(tree, removeUnusedAccounts = true) {
  let removed = 0;

  const nodesWithNoChildrenFn = node => node.isTitleAccount && node.children.length === 0;
  const nodesWithNoBalance = node => (node.firstBalance + node.balance) === 0;

  const pruneFn = (node) => {
    const shouldPrune = nodesWithNoChildrenFn(node);
    if (removeUnusedAccounts) {
      return (shouldPrune || nodesWithNoBalance(node));
    }

    return shouldPrune;
  };

  let i = 0;
  do {
    // remove parents that do not have children
    removed = tree.prune(pruneFn);
    i++;
  } while (removed > 0 || i === MAX_ITERATIONS);
}
