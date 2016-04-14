/**
* Debtor Group Annual Report
*
* This report is based of an report used in Congolese hospitals.  It shows the
* opening balance (debits and credits) at the end beginning of the fiscal year
* for each debtor group, the amount billed and payed over the course of the year
* and closing balances of each account.
*
* This report should only be availabe for years that have been both opened and
* closed, elapsing an entire billing cycle.
*/

var db      = require('../../../lib/db');
var numeral = require('numeral');

// takes in a date object, spits out
// dd-MM-yyyy format
function dateFmt(date) {
  var day = date.getDate(),
      month = date.getMonth() + 1,
      year = date.getFullYear();

  day = (day < 10) ? '0' + day : day;
  month = (month < 10) ? '0' + month: month;

  return [day, month, year].join('/');
}

// formats numbers into USD
function currencyFmt(amount) {
  var formatDollar = '$0,0.00';
  return numeral(amount).format(formatDollar);
}

// expose the http route
exports.compile = function (options) {
  'use strict';

  var sql,
      params = {},
      context = {},
      fiscalYearId = options.fy;

  context.i18n = (options.language === 'fr') ?
      require('../lang/fr.json').DEBTOR_GROUP_ANNUAL_REPORT :
      require('../lang/en.json').DEBTOR_GROUP_ANNUAL_REPORT;

  context.timestamp = dateFmt(new Date());

  // get some metadata about the fiscal year
  sql =
    'SELECT fy.fiscal_year_txt AS label, MIN(p.period_start) AS start, MAX(p.period_stop) AS stop, fy.previous_fiscal_year ' +
    'FROM fiscal_year AS fy JOIN period AS p ON fy.id = p.fiscal_year_id ' +
    'WHERE fy.id = ? AND p.period_number <> 0;';

  return db.exec(sql, [fiscalYearId])
  .then(function (rows) {
    var year = rows[0];

    context.meta = {
      label : year.label,
      start : dateFmt(year.start),
      stop  : dateFmt(year.stop),
      startDate : year.start,
      stopDate: year.stop
    };

    sql =
      'SELECT fy.fiscal_year_txt AS label, MIN(p.period_start) AS start, MAX(p.period_stop) AS stop ' +
      'FROM fiscal_year AS fy JOIN period AS p ON fy.id = p.fiscal_year_id ' +
      'WHERE fy.id = ? AND p.period_number <> 0;';

    return db.exec(sql, [year.previous_fiscal_year]);
  })
  .then(function (rows) {

    // this will not be null, since it is a join.
    var year = rows[0];

    if (year.stop === null) {
      context.meta.openingDate = context.meta.start;
    } else {
      context.meta.openingDate = dateFmt(year.stop);
    }

    // get the opening balances for the year by summing all periods less than
    // the start of the first one.
    sql =
      'SELECT account.id, account.number, dg.name, ' +
        'IFNULL(SUM(pt.debit), 0) AS debit, IFNULL(SUM(pt.credit), 0) AS credit ' +
      'FROM debtor_group AS dg LEFT JOIN period_total AS pt ON dg.account_id = pt.account_id ' +
      'JOIN account ON account.id = dg.account_id ' +
      'JOIN period AS p ON pt.period_id = p.id ' +
      'WHERE p.period_stop <= DATE(?) ' +
      'GROUP BY account.id;';

    return db.exec(sql, [context.meta.startDate]);
  })
  .then(function (accounts) {


    // reduce the accounts into a single account object with properties for beginning balance,
    // credits, debits, and closing balance
    context.accounts = accounts.reduce(function (object, account) {
      var id = account.number;

      object[id] = {};
      object[id].openingCredits = account.credit;
      object[id].openingDebits = account.debit;
      object[id].name = account.name;
      object[id].number = account.number;

      return object;
    }, {});

    // get the debits and credits for the entire year
    sql =
      'SELECT account.id, account.number, dg.name, ' +
        'IFNULL(SUM(pt.debit), 0) AS debit, IFNULL(SUM(pt.credit), 0) AS credit ' +
      'FROM debtor_group AS dg LEFT JOIN period_total AS pt ON dg.account_id = pt.account_id ' +
      'JOIN account ON account.id = dg.account_id ' +
      'JOIN period AS p ON pt.period_id = p.id ' +
      'WHERE p.fiscal_year_id = ? ' +
      'GROUP BY account.id;';

    return db.exec(sql, [fiscalYearId]);
  })
  .then(function (accounts) {

    accounts.forEach(function (a) {

      // if the account didn't have an opening balance, create it
      // TODO: this is kind of hacky code -- clean this up a bit
      if (!context.accounts[a.number]) {
        var o = context.accounts[a.number] = {};
        o.openingCredits = 0;
        o.openingDebits = 0;
        o.name = a.name;
        o.number = a.number;
      }

      var ref = context.accounts[a.number];
      ref.debits = a.debit;
      ref.credits = a.credit;
    });

    // get the ending balance (movements + beginning balances)
    sql =
      'SELECT account.id, account.number, dg.name, ' +
        'SUM(IFNULL(pt.debit, 0) - IFNULL(pt.credit, 0)) AS balance ' +
      'FROM debtor_group AS dg JOIN account ON account.id = dg.account_id ' +
      'LEFT JOIN period_total AS pt ON dg.account_id = pt.account_id ' +
      'JOIN period AS p ON pt.period_id = p.id ' +
      'WHERE p.period_stop <= DATE(?) ' +
      'GROUP BY account.id;';

    return db.exec(sql, [context.meta.stopDate]);
  })
  .then(function (accounts) {

    // put in the closing balances
    accounts.forEach(function (account) {
      var ref = context.accounts[account.number];
      ref.closingBalance = account.balance;
    });

    // record the size of the accounts object (number of accounts)
    context.meta.size = Object.keys(context.accounts).length;

    // create an aggregates object
    var aggregates = {
      openingDebits:  0,
      openingCredits: 0,
      debits:         0,
      credits:        0,
      closingBalance: 0
    };

    // loop through accounts and sum up all the balances
    context.totals = Object.keys(context.accounts).reduce(function (totals, account) {
      // pull in the account information
      var a = context.accounts[account];

      // loop through the account's properties, adding up each to the aggregate
      Object.keys(totals).forEach(function (k) {
        totals[k] += a[k];
      });

      return totals;
    }, aggregates);

    // format everything in USD
    Object.keys(context.accounts).forEach(function (key) {
      var account = context.accounts[key];

      Object.keys(account).forEach(function (k) {
        if (typeof account[k] === 'number' && k !== 'number') {
          account[k] = currencyFmt(account[k]);
        }
      });
    });

    // format the totals in USD
    Object.keys(context.totals).forEach(function (key) {
      context.totals[key] = currencyFmt(context.totals[key]);
    });

    return context;
  });
};
