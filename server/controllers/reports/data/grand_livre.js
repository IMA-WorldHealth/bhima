/**
* General Ledger Report
*
* Format the General Ledger PDF report.  Special care is taken to make sure the
* trans_id is properly ordered.
*/

var db = require('../../../lib/db'),
    numeral = require('numeral');

// dollar formatting
var formatDollar = '$0,0.00';

// expose the http route
exports.compile = function (options) {
  'use strict';
  var sql,
      context = {},
      fiscalYearId = options.fy;

  context.reportDate = new Date().toDateString();

  // This orders first by the numeric portion of the ID, then the text  portion.
  // NOTE -- we expect all abbreviations to be 3 characters long.  Anything else
  // will break this query.
  sql =
    `SELECT gl.trans_id, gl.trans_date, gl.description,
      gl.debit_equiv, gl.credit_equiv, account.number,
      fiscal_year.fiscal_year_txt, cost_center.text AS cc, profit_center.text AS pc
    FROM general_ledger AS gl JOIN account ON account.id = gl.account_id
    JOIN fiscal_year ON fiscal_year.id = gl.fiscal_year_id
    LEFT JOIN cost_center ON cost_center.id = gl.cc_id
    LEFT JOIN profit_center ON profit_center.id = gl.pc_id
    WHERE gl.fiscal_year_id = ?
    ORDER BY CAST(SUBSTRING(gl.trans_id FROM 4) AS unsigned), LEFT(gl.trans_id, 3);`;

  return db.exec(sql, [fiscalYearId])
  .then(function (data) {

    // group data by transaction using an object
    // TODO -- is this the best idea?  It seems like this will block the server
    context.data = data.reduce(function (transactions, row) {
      var id = row.trans_id;

      // format date string
      row.trans_date = row.trans_date.toDateString();
      row.debit_equiv = numeral(row.debit_equiv).format(formatDollar);
      row.credit_equiv = numeral(row.credit_equiv).format(formatDollar);

      // create an array for transaction rows
      if (!transactions[id]) { transactions[id] = []; }

      // push a new row onto the transaction
      transactions[id].push(row);

      return transactions;
    }, {});

    return context;
  });
};
