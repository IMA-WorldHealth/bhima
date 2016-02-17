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
    'SELECT exchange_rate.id, exchange_rate.enterprise_id, exchange_rate.currency_id, exchange_rate.rate, exchange_rate.date, ' +
    'enterprise.currency_id AS \'enterprise_currency_id\' ' +
    'FROM exchange_rate ' +
    'JOIN enterprise ON enterprise.id = exchange_rate.enterprise_id ' + 
    'WHERE exchange_rate.enterprise_id = ? ' +
    'ORDER BY date;';

  db.exec(sql, [ enterprise.id ])
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
    'INSERT INTO exchange_rate (enterprise_id, currency_id, rate, date) ' +
    'VALUES (?);';

  db.exec(sql, [[data.enterprise_id, data.currency_id, data.rate, data.date ]])
  .then(function (row) {
    res.status(201).json({ id: row.insertId });
  })
  .catch(next)
  .done();
};


// PUT /exchange/:id
exports.update = function update(req, res, next) {
  'use strict';

  var sql;

  sql =
    'UPDATE exchange_rate SET ? WHERE id = ?;';

  db.exec(sql, [req.body, req.params.id])
  .then(function () {

    sql =
      'SELECT exchange_rate.id, exchange_rate.enterprise_id, exchange_rate.currency_id, exchange_rate.rate, exchange_rate.date, ' +
      'enterprise.currency_id AS \'enterprise_currency_id\' ' +
      'FROM exchange_rate ' +
      'JOIN enterprise ON enterprise.id = exchange_rate.enterprise_id ' + 
      'WHERE exchange_rate.id = ?;';

    return db.exec(sql, [req.params.id]);
  })
  .then(function (rows) {

    if (rows.length === 0) {
      throw new req.codes.ERR_NOT_FOUND();
    }

    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
};

// DELETE /exchange/:id
exports.delete = function del(req, res, next) {
  'use strict';

  var sql =
    'DELETE FROM exchange_rate WHERE id = ?;';

  db.exec(sql, [req.params.id])
  .then(function (row) {

    // if nothing happened, let the client know via a 404 error
    if (row.affectedRows === 0) {
      throw new req.codes.ERR_NOT_FOUND();
    }

    res.status(204).send();
  })
  .catch(next)
  .done();
};

