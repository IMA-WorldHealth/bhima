/**
* Exchange Rate Controller
*
* This controller exposes an API to the client for reading and writing exchange
* rates.
*/
var db = require('../../lib/db');

// GET /exchange
//
// The enterprise currency is assumed from the session.
exports.list = function list(req, res, next) {
  'use strict';

  var sql,
      enterprise = req.session.enterprise;
  
  sql =
    'SELECT foreign_currency_id AS currency_id, rate, date ' +
    'FROM exchange_rate ' + 
    'WHERE enterprise_currency_id = ? ' +
    'ORDER BY date;';

  db.exec(sql, [ enterprise.currency_id ])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

// POST /exchange
exports.create = function create(req, res, next) {
  'use strict';

  var sql,
      data = req.body.rate;

  // preprocess dates
  if (data.date) {
    data.date = new Date(data.date);
  }

  sql =
    'INSERT INTO exchange_rate (enterprise_currency_id, foreign_currency_id, rate, date) ' +
    'VALUES (?);';

  db.exec(sql, [[data.enterprise_currency_id, data.foreign_currency_id, data.rate, data.date ]])
  .then(function (row) {
    res.status(201).json({ id: row.insertId });
  })
  .catch(next)
  .done();
};
