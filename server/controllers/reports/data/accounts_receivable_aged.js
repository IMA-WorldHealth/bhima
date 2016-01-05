// reports_proposed/data/accounts_receivable_aged.js
// Aggregates the debtor balances for all enterprise debtors, optionally
// ignoring those with zero balances
var q = require('q'),
    db = require('../../../lib/db'),
    numberal = require('numeral');

// initiliase the database connection
//db.initialise();

// formatting for us dollars
var formatDollar = '$0,0.00';
var today = new Date();

// expose HTTP route
exports.compile = function (options) {
  'use strict';

  var dfd = q.defer(),
      context = {};

  context.reportDate = today.toDateString();

  // This is the following SQL query in proper format
  // SELECT CONCAT(first_name, ' ', last_name) AS name, f.uuid, SUM(c1) AS c1, SUM(c2) AS c2, SUM(c3) AS c3, SUM(c4) AS c4, SUM(c5) as c5 FROM (SELECT g.uuid, IF(age BETWEEN 0 AND 30, balance, NULL) c1, IF(age BETWEEN 31 AND 60, balance, NULL) c2, IF(age BETWEEN 61 AND 90, balance, NULL) c3, IF(age BETWEEN 91 AND 120, balance, NULL) c4, IF(age>120, balance, NULL) c5 FROM (SELECT d.uuid, dg.account_id, TIMESTAMPDIFF(DAY, gl.trans_date, CURDATE()) AS age , debit_equiv - credit_equiv AS balance FROM debitor_group AS dg JOIN debitor AS d JOIN general_ledger as gl ON d.group_uuid = dg.uuid AND gl.deb_cred_uuid = d.uuid GROUP BY d.uuid, age) AS g) AS f JOIN patient AS p ON f.uuid = p.debitor_uuid GROUP BY uuid;
  var sql =
    'SELECT CONCAT(first_name, " ", last_name) AS name, f.uuid, SUM(c1) AS c1, SUM(c2) AS c2, ' +
      'SUM(c3) AS c3, SUM(c4) AS c4, SUM(c5) as c5 ' +
    'FROM (' +
      'SELECT g.uuid, IF(age BETWEEN 0 AND 30, balance, NULL) c1, IF(age BETWEEN 31 AND 60, balance, NULL) c2, ' +
        'IF(age BETWEEN 61 AND 90, balance, NULL) c3, IF(age BETWEEN 91 AND 120, balance, NULL) c4, ' +
        'IF(age>120, balance, NULL) c5 ' +
      'FROM (' +
        'SELECT d.uuid, dg.account_id, TIMESTAMPDIFF(DAY, gl.trans_date, CURDATE()) AS age, ' +
          '(debit_equiv - credit_equiv) AS balance ' +
        'FROM debitor_group AS dg JOIN debitor AS d JOIN general_ledger as gl ON ' +
          'd.group_uuid = dg.uuid AND ' +
          'gl.deb_cred_uuid = d.uuid ' +
        'GROUP BY d.uuid, age' +
      ') AS g' +
    ') AS f ' +
    'JOIN patient AS p ON f.uuid = p.debitor_uuid ' +
    'GROUP BY uuid;';

  // NOTE
  // The above SQL query does not do (global) totalling.  They must be calculated
  // in JavaScript.
  //
  // FIXME
  // This SQL finds all PATIENTS, not all DEBTORS.  We should
  // think about partitioning debtors and patients into separate
  // entities related via some joiner.

  // execute and expose data.
  db.exec(sql)
  .then(function (rows) {
    context.data = rows;
    dfd.resolve(context);
  })
  .catch(dfd.reject)
  .done();

  return dfd.promise;
};
