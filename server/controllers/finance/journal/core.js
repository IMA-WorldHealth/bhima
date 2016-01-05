// controllers/journal/core.js

/*
 * This controller provides core utilities to all the
 * posting functions.  Any utility shared between two
 * posting checks should be contained here.
 *
 * First, common checks are defined.
 * Then shared queries are defined.
 * Finally, shared errors are defined.
 *
 * TODO
 *   - Formalize error handling. Each error should return an
 *   error code to be translated and logged.
 *   - remove the redundent myExchangeRate() and ExchangeRate()
 */

var q = require('q'),
    db = require('../../../lib/db'),
    Store = require('../../../lib/store');

// shared checks
var checks = {};

// check if the date is within a valid period that is not locked
// NOTE: this does not check
//   1) if the date is in the future
//   2) if the period belongs to the correct enterprise
checks.validPeriod = function (enterpriseId, date) {
  var sql =
    'SELECT period.id, period.fiscal_year_id ' +
    'FROM period ' +
    'JOIN fiscal_year ON fiscal_year.id = period.fiscal_year_id '+
    'WHERE period.period_start <= ? AND ' +
      'period.period_stop >= ? AND ' +
      'period.locked = 0 AND fiscal_year.locked = 0;';
  return db.exec(sql, [date, date])
  .then(function (rows) {
    if (rows.length === 0) {
      throw new Error('No period found to match the posted date : ' + date);
    }
    return q(rows);
  });
};

// checks if the deb_cred_uuid field is actually a debitor or a creditor.
checks.validDebtorOrCreditor = function (id) {
  // NOTE: This is NOT STRICT. It may find a debitor when a creditor was
  // requested, or vice versa.  This is fine for the checks here, but not
  // for posting to the general ledger.
  var sql =
    'SELECT uuid ' +
    'FROM (' +
      'SELECT debitor.uuid FROM debitor WHERE uuid = ? ' +
    'UNION ' +
      'SELECT creditor.uuid FROM creditor WHERE uuid = ?' +
    ')c;';
  return db.exec(sql, [id, id])
  .then(function (rows) {
    if (rows.length === 0) {
      throw new Error('No Debitor or Creditor found with id: ' + id);
    }
    return q(rows);
  });
};

// shared queries
var queries = {};

// find the origin (id) of a table involved in the transaction
queries.origin = function (table) {
  // uses the transaction_type table to derive an origin_id
  // to post to the journal.  Returns the id.

  var sql =
    'SELECT id, service_txt FROM transaction_type WHERE service_txt = ?;';

  return db.exec(sql, [table])
  .then(function (rows) {
    if (rows.length === 0) {
      throw new Error('Cannot find origin for transaction type : ' + table);
    }

    // FIXME this is kind of dangerous
    return q(rows[0].id);
  });
};

// get a new transaction id for a given project
queries.transactionId = function (projectId) {
  'use strict';

  var sql =
    'SELECT CONCAT(abbr, IFNULL(MAX(increment), 1)) AS id FROM (' +
      'SELECT project.abbr, MAX(FLOOR(SUBSTR(trans_id, 4))) + 1 AS increment ' +
      'FROM posting_journal JOIN project ON posting_journal.project_id = project.id ' +
      'WHERE posting_journal.project_id = ? ' +
    'UNION ' +
      'SELECT project.abbr, MAX(FLOOR(SUBSTR(trans_id, 4))) + 1 AS increment ' +
      'FROM general_ledger JOIN project ON general_ledger.project_id = project.id ' +
      'WHERE general_ledger.project_id = ?)c;';

  return db.exec(sql, [projectId, projectId])
  .then(function (rows) {

    // This is guaranteed to be defined if a project is defined.
    // Even if there is no data in the posting journal and/or
    // general ledger
    return q(rows[0].id);
  });
};

// find the correct periodId for a given date
queries.period = function (date) {
  'use strict';

  var sql =
    'SELECT period.id, period.fiscal_year_id FROM period ' +
    'JOIN fiscal_year ON fiscal_year.id=period.fiscal_year_id ' +
    'WHERE fiscal_year.locked = 0 AND (period_start <= DATE(?) AND ' +
      'period_stop >= DATE(?));';

  return db.exec(sql, [date, date])
  .then(function (rows) {
    if (rows.length === 0) {
      throw new Error('Pas de periode pour la date : ' + date + ' et verifie que \'annee fiscale n\'est pas fermee');
    }
    return q(rows[0]);
  });
};

// get the exchange rate for a given date
queries.exchangeRate = function (date) {
  'use strict';

  // expects a mysql-compatible date

  var sql =
    'SELECT enterprise_currency_id, foreign_currency_id, rate, ' +
      'min_monentary_unit ' +
    'FROM exchange_rate JOIN currency ON exchange_rate.foreign_currency_id = currency.id ' +
    'WHERE exchange_rate.date = DATE(?);';

  return db.exec(sql, [date])
  .then(function (rows) {
    if (rows.length === 0) {
      throw new Error('No exchange rate found for date : ' + date);
    }

    var store = new Store();
    rows.forEach(function (line) {
      store.post({ id : line.foreign_currency_id, rate : line.rate });
      store.post({ id : line.enterprise_currency_id, rate : 1});
    });

    return q(store);
  });
};

// get the exchange rate for a given date
queries.myExchangeRate = function (date) {
  'use strict';

  // expects a mysql-compatible date
  var sql =
    'SELECT enterprise_currency_id, foreign_currency_id, rate ' +
    'FROM exchange_rate JOIN currency ON ' +
      'exchange_rate.foreign_currency_id = currency.id ' +
    'WHERE exchange_rate.date = DATE(?);';

  return db.exec(sql, [date])
  .then(function (rows) {
    if (rows.length === 0) {
      throw new Error('No exchange rate found for date : ' + date);
    }

    var store = new Store();
    rows.forEach(function (line) {
      store.post({ id : line.foreign_currency_id, rate : line.rate });
      store.post({ id : line.enterprise_currency_id, rate : 1});
    });

    return q(store);
  });
};

// shared errors
// TODO
var errors = {};

// expose to controllers
exports.checks = checks;
exports.queries = queries;
exports.errors = errors;
