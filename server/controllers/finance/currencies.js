/**
 * @module Currencies
 *
 * Supports two routes for reading currency information from the database.
 *
 * @requires db
 * @requires NotFound
 */

var db = require('../../lib/db');
var NotFound = require('../../lib/errors/NotFound');

/** list currencies in the database */
exports.list = function list(req, res, next) {
  const sql =
    `SELECT currency.id, currency.name, currency.note, currency.format_key,
      currency.symbol, currency.min_monentary_unit, latest_rate.date
    FROM currency left join (select * from exchange_rate group by id order by date asc) as latest_rate
    ON currency.id = latest_rate.currency_id group by currency.id;`;

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

/** get the details of a single currency */
exports.detail = function detail(req, res, next) {
  const sql =
    `SELECT c.id, c.name, c.note, c.format_key,
      c.symbol, c.min_monentary_unit
    FROM currency AS c
    WHERE c.id = ?;`;

  db.one(sql, [req.params.id])
  .then(function (rows) {
    if (rows.length === 0) {
      throw new NotFound(`Could not find a currency with id ${req.params.id}`);
    }
    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
};
