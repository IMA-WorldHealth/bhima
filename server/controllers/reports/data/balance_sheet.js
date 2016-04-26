/**
* Balance Sheet Report
*
* Produces an enteprise balance sheet for a given fiscal year.  The balance sheet
* is an up to date snapshot of the financial situation of an enterprise.  It takes
* into account balance accounts and title accounts (for formatting purposes).
*/

var q       = require('q');
var db      = require('../../../lib/db');
var numeral = require('numeral');

// Constant: root account id
var ROOT_ACCOUNT_ID = 0;

var formatDollar = '$0,0.00';
var balanceDate = new Date();

// This method builds a tree data structure of
// accounts and children of a specified parentId.
function buildAccountTree(accounts, parentId, depth) {
  var children;

  // Base case: There are no child accounts
  // Return an empty array
  if (accounts.length === 0) { return []; }

  // Returns all accounts where the parent is the
  // parentId
  children = accounts.filter(function (account) {
    return account.parent === parentId;
  });

  // Recursively call get children on all child accounts
  // and attach them as childen of their parent account
  children.forEach(function (account) {
    account.depth = depth;
    account.children = buildAccountTree(accounts, account.id, depth + 1);
  });

  return children;
}

// Adds the balance of a list of accounts to
// an aggregate value
function aggregate(value, account) {

  var isLeaf = account.children.length === 0;

  account.balance = account.balance;

  // FIXME Balances are ONLY ever assigned to the very top level accounts, not for every title account
  account.formattedBalance = numeral(account.balance).format(formatDollar);

  // if the account has children, recursively
  // recursively call aggregate on the array of accounts
  if (!isLeaf) {
    return value + account.children.reduce(aggregate, 0);
  }

  return value + account.balance;
}

// remove title accounts that have no children
function filterEmptyTitleAccounts(tree) {
  return tree.filter(function (account) {

    // recurse on children
    account.children = filterEmptyTitleAccounts(account.children);

    // if the account is a title account and has no children, return false
    return account.children.length !== 0 || account.type !== 'title';
  });
}

// expose the http route
exports.compile = function (options) {
  'use strict';

  var sql,
      context = {},
      params = {},
      fiscalYearId = options.fy;

  context.reportDate = balanceDate.toDateString();

  // FIXME/TODO -- n
  sql =
    `SELECT account.id, account.number, account.label, account.type_id,
      account.parent, IFNULL(totals.debit, 0) AS debit, IFNULL(totals.credit, 0) AS credit,
      IFNULL(totals.balance, 0) AS balance, account_type.type
    FROM account LEFT JOIN (
      SELECT pt.account_id, IFNULL(pt.debit, 0) AS debit, IFNULL(pt.credit, 0) as credit,
        IFNULL(SUM(pt.debit - pt.credit), 0) as balance
      FROM period_total AS pt
      WHERE pt.fiscal_year_id = ?
      GROUP BY pt.account_id
    ) AS totals ON totals.account_id = account.id
    JOIN account_type ON account_type.id = account.type_id
    WHERE account.type_id IN (?, ?) AND account.is_ohada = 1;`;

  // first we want to get the proper account ids for the balance accounts
  // and title accounts
  return db.exec('SELECT id FROM account_type WHERE type = "balance";')
  .then(function (rows) {
    params.balanceId = rows[0].id;

    return db.exec('SELECT id FROM account_type WHERE type = "title";');
  })
  .then(function (rows) {
    params.titleId = rows[0].id;
    return db.exec('SELECT fiscal_year_txt AS label FROM fiscal_year WHERE id = ?;', [fiscalYearId]);
  })
  .then(function (rows) {
    context.yearText = rows[0].label;
    return db.exec(sql, [fiscalYearId, params.balanceId, params.titleId]);
  })
  .then(function (accounts) {
    var accountTree;

    // loop through and properly format debits and credits
    accounts.forEach(function (account) {
      account.formatCredit  = numeral(account.credit).format(formatDollar);
      account.formatDebit   = numeral(account.debit).format(formatDollar);
      account.formatBalance = numeral(account.balance).format(formatDollar);
    });

    // Create the accounts and balances into a tree
    // data structure
    accountTree = buildAccountTree(accounts, ROOT_ACCOUNT_ID, 0);

    // aggregate the account balances of child accounts into
    // the parent account
    accountTree.forEach(function (account) {
      account.balance = account.children.reduce(aggregate, 0);
      account.formattedBalance = numeral(account.balance).format(formatDollar);
    });

    // filter empty title accounts
    accountTree = filterEmptyTitleAccounts(accountTree);

    context.data = accountTree;
    return context;
  });
};
