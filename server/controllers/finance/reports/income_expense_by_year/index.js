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

const util = require('../../../../lib/util');
const Fiscal = require('../../fiscal');

const TEMPLATE = './server/controllers/finance/reports/income_expense_by_year/report.handlebars';

const INCOME_TYPE_ID = 4;
const EXPENSE_TYPE_ID = 5;
const TITLE_ID = 6;

const DEFAULT_PARAMS = {
  csvKey : 'rows',
  filename : 'TREE.INCOME_EXPENSE_BY_MONTH',
};

// expose to the API
exports.document = document;

async function document(req, res, next) {
  let report;

  const options = _.defaults(req.query, DEFAULT_PARAMS);

  const removeUnusedAccounts = !!+options.removeUnusedAccounts;

  try {
    report = new ReportManager(TEMPLATE, req.session, options);
  } catch (e) {
    next(e);
    return;
  }

  const { fiscalYearId } = options;
  const data = {};

  const thirdYear = await Fiscal.lookupFiscalYear(fiscalYearId);
  const secondYear = await Fiscal.lookupFiscalYear(thirdYear.previous_fiscal_year_id);
  const firstYear = await Fiscal.lookupFiscalYear(secondYear.previous_fiscal_year_id);

  if (!firstYear || !secondYear || !thirdYear) {
    res.status(500).json({ msg : `bad fiscal year's range` });
    return;
  }
  _.extend(data, {
    firstYear,
    secondYear,
    thirdYear,
  });

  const [firstBalances, secondBalances, thirdBalances] = await Promise.all([
    getAccountBalances(firstYear.id),
    getAccountBalances(secondYear.id),
    getAccountBalances(thirdYear.id),
  ]);

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
  const emptyTotal = {
    balance : 0,
    firstBalance : 0,
    thirdBalance : 0,
  };
  const totals = {
    income : profits[0] || emptyTotal,
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
    profits,
    losses,
    totals,
  });

  report.render(data)
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}

/**
 * @function getAccountBalances
 *
 */
function getAccountBalances(fiscalYearId) {
  const sql = `
    SELECT a.id, a.number, a.label, a.type_id, a.label, a.parent,
      a.type_id = ${TITLE_ID} AS isTitleAccount, balance
    FROM account AS a LEFT JOIN (
      SELECT pt.account_id, SUM(pt.debit - pt.credit) AS balance
      FROM period_total AS pt
      JOIN period AS p ON p.id = pt.period_id
      WHERE pt.fiscal_year_id = ?
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

  const params = [fiscalYearId, accountTypes];
  return db.exec(sql, params);
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
      _.extend(record, second, {
        firstBalance,
        thirdBalance,
      });
    } else if (first) {
      const thirdBalance = third ? third.balance : 0;
      _.extend(record, first, {
        balance : 0,
      }, {
        firstBalance : first.balance,
        thirdBalance,
      });
    } else {
      _.extend(record, third, {
        balance : 0,
        firstBalance : 0,
      }, {
        thirdBalance : third.balance,
      });
    }

    return record;
  });
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
