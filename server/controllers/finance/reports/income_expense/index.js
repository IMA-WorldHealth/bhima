/**
 * Income Expense Controller
 *
 * This controller is responsible for processing the income and expense report.
 *
 * @module finance/incomeExpense
 *
 * @requires lodash
 * @requires lib/db
 * @requires lib/ReportManager
 * @requires lib/errors/BadRequest
 * @requires lib/Tree
 * @requires constrollers/fiscal
 */


const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');
const BadRequest = require('../../../../lib/errors/BadRequest');
const Tree = require('../../../../lib/Tree');
const Fiscal = require('../../fiscal');

const TEMPLATE = './server/controllers/finance/reports/income_expense/report.handlebars';

const INCOME_TYPE_ID = 4;
const EXPENSE_TYPE_ID = 5;
const TITLE_ID = 6;

const DEFAULT_PARAMS = {
  csvKey : 'rows',
  filename : 'TREE.INCOME_EXPENSE',
  orientation : 'landscape',
  footerRight : '[page] / [toPage]',
};

// expose to the API
exports.document = document;

function document(req, res, next) {
  let report;

  const options = _.defaults(req.query, DEFAULT_PARAMS);

  try {
    report = new ReportManager(TEMPLATE, req.session, options);
  } catch (e) {
    next(e);
    return;
  }

  const { periodFromId, periodToId, fiscalYearId } = options;
  const data = {};

  Promise.all([
    getPeriodById(periodFromId),
    getPeriodById(periodToId),
    Fiscal.lookupFiscalYear(fiscalYearId),
  ])
    .then(([periodFrom, periodTo, fiscalYear]) => {
      if (periodFrom.start_date > periodTo.start_date) {
        throw new BadRequest('The date range is inverted.');
      }

      _.extend(data, { periodFrom, periodTo, fiscalYear });

      // retrieve both the current balances and the previous year balances
      return Promise.all([
        getAccountBalances(fiscalYear.id, periodFrom.number, periodTo.number),
        getAccountBalances(fiscalYear.previous_fiscal_year_id, periodFrom.number, periodTo.number),
        Fiscal.lookupFiscalYear(fiscalYear.previous_fiscal_year_id),
      ]);
    })
    .then(([currentBalances, previousBalances, previousFiscalYear]) => {
      const dataset = combineIntoSingleDataset(currentBalances, previousBalances);
      const tree = constructAndPruneTree(dataset);

      const root = tree.getRootNode();

      const isIncomeFirstElement = root.children[0].isIncomeAccount;

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
      const emptyTotal = { balance : 0, previousBalance : 0, difference : 0 };
      const totals = {
        income :  profits[0] || emptyTotal,
        expense : losses[0] || emptyTotal,
      };

      // computes the variance on the income/expense
      profits.forEach(account => {
        account.variance = variance(account.balance, account.previousBalance);
      });

      losses.forEach(account => {
        account.variance = variance(account.balance, account.previousBalance);
      });

      _.extend(data, {
        profits, losses, previousFiscalYear, totals,
      });

      return report.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}

function variance(current, previous) {
  const difference = (previous - current);
  return -1 * (difference / previous);
}


/**
 * @function getAccountBalances
 *
 * @description
 * Returns the balances of the accounts by fiscal year and period range.  This
 * function uses period _numbers_ instead of period _ids_ to permit reuse of the
 * same function with multiple fiscal year ids.  Period ids embed the FY id.
 */
function getAccountBalances(fiscalYearId, periodFromNumber, periodToNumber) {
  const sql = `
    SELECT a.id, a.number, a.label, a.type_id, a.label, a.parent,
      a.type_id = ${TITLE_ID} AS isTitleAccount, balance
    FROM account AS a LEFT JOIN (
      SELECT pt.account_id, SUM(pt.debit - pt.credit) AS balance
      FROM period_total AS pt
      JOIN period AS p ON p.id = pt.period_id
      WHERE pt.fiscal_year_id = ?
        AND p.number BETWEEN ? AND ?
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

  return db.exec(sql, [fiscalYearId, periodFromNumber, periodToNumber, accountTypes]);
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
 * previous balances are assigned to previousBalance property.  Missing data is
 * filled in with zeroes.
 *
 * @returns Array
 */
function combineIntoSingleDataset(currentBalances, previousBalances) {
  // make an id -> account map for both values
  const currentMap = new Map(currentBalances.map(a => [a.id, a]));
  const previousMap = new Map(previousBalances.map(a => [a.id, a]));

  // get all account ids in a single list.
  const combined = _.uniq([...currentMap.keys(), ...previousMap.keys()]);

  return combined.map(id => {
    const record = {};

    const current = currentMap.get(id);
    const previous = previousMap.get(id);

    if (current) {
      const previousBalance = previous ? previous.balance : 0;
      _.extend(record, current, { previousBalance });
    } else {
      _.extend(record, previous, { balance : 0 }, { previousBalance : previous.balance });
    }

    // compute the difference between this and last year's balance
    record.difference = (record.balance - record.previousBalance);

    return record;
  });
}


/**
 * @function constructAndPruneTree
 *
 * @description
 * Receives a dataset of balances and creates the account tree.
 */
function constructAndPruneTree(dataset) {
  const tree = new Tree(dataset);

  const properties = [
    'balance', 'previousBalance', 'difference', 'variance',
  ];

  const bulkSumFn = (currentNode, parentNode) => {
    properties.forEach(key => {
      parentNode[key] = (parentNode[key] || 0) + currentNode[key];
    });
  };

  // sum the values in the tree
  tree.walk(bulkSumFn, false);

  // prune tree until all unused unused leaves fall off.
  pruneTree(tree);

  // label income/expense branches
  tree.walk((node, parentNode) => {
    parentNode.isIncomeAccount = (node.isIncomeAccount || node.type_id === INCOME_TYPE_ID);
    parentNode.isExpenseAccount = (node.isExpenseAccount || node.type_id === EXPENSE_TYPE_ID);
  }, false);

  // label depths of nodes
  tree.walk(Tree.common.computeNodeDepth);

  return tree;
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
  const nodesWithNoBalance = node => (node.previousBalance + node.balance) === 0;

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
