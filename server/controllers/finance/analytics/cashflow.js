var db = require('../../../lib/db'),
    q = require('q');

// GET /analytics/cashboxes
exports.getCashBoxes = function (req, res, next) {
  'use strict';

  var sql =
    'SELECT c.id, c.text FROM cash_box AS c;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();

};

// given a cashbox id and optional a currency id, return
// an array of accounts
function getAccountIds(cashBoxId, currencyId) {
  'use strict';

  var sql, accounts;

  // get the correct account id(s) from the cash_box_account_currency table.
  sql =
    'SELECT account_id FROM cash_box_account_currency JOIN cash_box ' +
      'ON cash_box.id = cash_box_account_currency.cash_box_id ' +
    'WHERE cash_box_id = ?';

  // if we are given a currencyId, that narrows the account_ids we are getting
  sql += (currencyId !== undefined) ? ' AND currency_id = ?;' : ';';

  // based on the cashBoxId, select the correct accountId (or use all).
  return db.exec(sql, [cashBoxId, currencyId])
  .then(function (rows) {
    accounts = rows.map(function (r) { return r.account_id; });
    return q(accounts);
  });
}

// GET /analytics/cashboxes/:id/balance?hasPostingJournal=0&currencyId=1
exports.getCashBoxBalance = function (req, res, next) {
 'use strict';

  var sql;

  getAccountIds(req.params.id, req.query.currencyId)
  .then(function (accounts) {

    // check if we are including the posting journal or not
    if (req.query.hasPostingJournal) {
      sql =
        'SELECT COUNT(DISTINCT trans_id) AS transactions, SUM(debit_equiv) AS debit, SUM(credit_equiv) AS credit, ' +
          'SUM(debit_equiv - credit_equiv) AS balance, account_id ' +
        'FROM (' +
          'SELECT trans_id, account_id, debit_equiv, credit_equiv ' +
          'FROM posting_journal ' +
          'UNION SELECT trans_id, account_id, debit_equiv, credit_equiv ' +
          'FROM general_ledger' +
        ')c ' +
        'WHERE account_id IN (?) ' +
        'GROUP BY account_id;';
    } else {
      sql =
        'SELECT COUNT(DISTINCT trans_id) AS transactions, SUM(debit_equiv) AS debit, SUM(credit_equiv) AS credit, ' +
          'SUM(debit_equiv - credit_equiv) AS balance, account_id ' +
        'FROM general_ledger ' +
        'WHERE account_id IN (?) ' +
        'GROUP BY account_id;';
    }

    return db.exec(sql, [accounts]);
  })
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

// GET /analytics/cashboxes/:id/history?hasPostingJournal=0&currencyId=1&grouping=month
// grouping can be (month || year || day)
exports.getCashBoxHistory = function (req, res, next) {
  'use strict';

  var sql;

  getAccountIds(req.params.id, req.query.currencyId)
  .then(function (accounts) {

    // check if we are including the posting journal or not
    if (req.query.hasPostingJournal) {
      sql =
        'SELECT COUNT(trans_id) AS transactions, SUM(debit_equiv) AS debit, SUM(credit_equiv) AS credit, ' +
          'SUM(debit_equiv - credit_equiv) AS balance, trans_date, account_id ' +
        'FROM (' +
          'SELECT trans_id, account_id, trans_date, debit_equiv, credit_equiv ' +
          'FROM posting_journal ' +
          'UNION SELECT trans_id, account_id, trans_date, debit_equiv, credit_equiv ' +
          'FROM general_ledger' +
        ')c ' +
        'WHERE account_id IN (?) ';
    } else {
      sql =
        'SELECT COUNT(trans_id) AS transactions, SUM(debit_equiv) AS debit, SUM(credit_equiv) AS credit, ' +
          'SUM(debit_equiv - credit_equiv) AS balance, trans_date, account_id ' +
        'FROM general_ledger ' +
        'WHERE account_id IN (?) ';
    }

    // now we tackle the grouping using MySQL's Date/Time functions
    switch (req.query.grouping.toLowerCase()) {
      case 'year':
        sql += 'GROUP BY account_id, YEAR(trans_date);';
        break;
      case 'month':
        sql += 'GROUP BY account_id, YEAR(trans_date), MONTH(trans_date);';
        break;
      case 'week' :
        sql += 'GROUP BY account_id, YEAR(trans_date), DAYOFWEEK(trans_date) ORDER BY DAYOFWEEK(trans_date);';
        break;
      case 'day':
        sql += 'GROUP BY account_id, YEAR(trans_date), MONTH(trans_date), DAY(trans_date);';
        break;
      default:
        sql += 'GROUP BY account_id;';
        break;
    }

    return db.exec(sql, [accounts]);
  })
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

// GET /analytics/debtors/top
exports.getTopDebtors = function (req, res, next) {
  'use strict';

  var limit = Number(req.query.limit),
      sql;

  // pull in the debtors owing the most, group names, and balancek
  sql =
    'SELECT journal.deb_cred_uuid AS uuid, journal.balance, dg.name AS debtorGroupName, d.text AS debtorText ' +
    'FROM (' +
      'SELECT deb_cred_uuid, SUM(debit_equiv - credit_equiv) AS balance FROM posting_journal WHERE deb_cred_type = \'D\' GROUP BY deb_cred_uuid ' +
      'UNION ' +
      'SELECT deb_cred_uuid, SUM(debit_equiv - credit_equiv) AS balance FROM general_ledger WHERE deb_cred_type = \'D\' GROUP BY deb_cred_uuid ' +
    ') AS journal JOIN debtor AS d JOIN debtor_group AS dg ON ' +
      'd.uuid = journal.deb_cred_uuid AND dg.uuid = d.group_uuid ' +
    'WHERE balance <> 0 ' +
    'ORDER BY balance DESC ' +
    'LIMIT ?;';

  // default to large number in case no limit is provided
  db.exec(sql, [isNaN(limit) ? 1000000 : limit])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

// GET /analytics/debtorgroups/top
exports.getTopDebtorGroups = function (req, res, next) {
  'use strict';

  var limit = Number(req.query.limit),
      accounts, sql;

  sql =
    'SELECT account_id FROM debtor_group;';

  db.exec(sql)
  .then(function (rows) {
    accounts = rows.map(function (r) { return r.account_id; });

    // find the debtor groups owing the most, group names, and balance
    sql =
      'SELECT dg.uuid, dg.name, SUM(t.debit_equiv - t.credit_equiv) AS balance, a.number FROM (' +
        'SELECT account_id, debit_equiv, credit_equiv FROM posting_journal WHERE account_id IN (?) ' +
        'UNION ' +
        'SELECT account_id, debit_equiv, credit_equiv FROM general_ledger WHERE account_id IN (?) ' +
     ') AS t JOIN account AS a ON t.account_id = a.id ' +
     'JOIN debtor_group AS dg ON t.account_id = dg.account_id ' +
     'GROUP BY t.account_id ' +
     'ORDER BY balance DESC ' +
     'LIMIT ?;';

    // default to large number in case no limit is provided
    // FIXME - can we do better?
    return db.exec(sql, [accounts, accounts, isNaN(limit) ? 1000000 : limit]);
  })
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};
