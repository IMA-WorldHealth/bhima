/**
 * Supports two routes for reading currency information from the database.
 *
 * @module finance/currencies
 * @requires lib/db
 */

var db = require('../../lib/db');
var NotFound = require('../../lib/errors/NotFound');

/** list currencies in the database */
exports.list = function list(req, res, next) {
  'use strict';

  var sql =
    'SELECT c.id, c.name, c.note, c.format_key, ' +
      'c.symbol, c.min_monentary_unit ' +
    'FROM currency AS c;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

/** get the details of a single currency */
exports.detail = function detail(req, res, next) {

  var sql =
    'SELECT c.id, c.name, c.note, c.format_key, ' +
      'c.symbol, c.min_monentary_unit ' +
    'FROM currency AS c ' +
    'WHERE c.id = ?;';

  db.exec(sql, [ req.params.id ])
  .then(function (rows) {
    if (rows.length === 0) {
      throw new NotFound(`Could not find a currency with id ${req.params.id}`);
    }

    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
};
