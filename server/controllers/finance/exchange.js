/**
 * Exchange Rate Controller
 *
 * This controller exposes an API to the client for reading and writing exchange
 * rates.
 */

const db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');

exports.getExchangeRate = getExchangeRate;

// uses the mysql function getExchangeRate() to find
// the correct exchange rate
function getExchangeRate(enterpriseId, currencyId, date) {
  const sql = 'SELECT GetExchangeRate(?, ?, ?) AS rate;';

  return db.exec(sql, [enterpriseId, currencyId, new Date(date)])
    .then(rows => rows[0]);
}

/**
 * @method list
 *
 * @description
 * This function lists all exchange rates in the database tied to
 * the session enterprises.
 *
 * URL: /exchange
 */
exports.list = function list(req, res, next) {
  const enterprise = req.session.enterprise;
  const options = req.query;

  getExchangeRateList(enterprise.id, options)
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
};

/**
 * @function getExchangeRateList
 * @private
 *
 * @description
 * Returns the list of exchange rates tied to a particular enterprise.
 */
function getExchangeRateList(enterpriseId, opts) {
  const options = opts || {};

  const limit = Number(options.limit);
  const limitQuery = Number.isNaN(limit) ? '' : `LIMIT ${limit}`;

  const sql = `
    SELECT exchange_rate.id, exchange_rate.enterprise_id, exchange_rate.currency_id, 
    exchange_rate.rate, exchange_rate.date, enterprise.currency_id AS 'enterprise_currency_id'
    FROM exchange_rate
    JOIN enterprise ON enterprise.id = exchange_rate.enterprise_id
    WHERE exchange_rate.enterprise_id = ?
    ORDER BY date DESC
    ${limitQuery};
  `;

  return db.exec(sql, [enterpriseId]);
}

// POST /exchange
exports.create = function create(req, res, next) {
  const data = req.body.rate;

  // pre-process dates for mysql insertion
  if (data.date) {
    data.date = new Date(data.date);
  }

  const sql =
    `INSERT INTO exchange_rate (enterprise_id, currency_id, rate, date)
    VALUES (?);`;

  db.exec(sql, [[data.enterprise_id, data.currency_id, data.rate, data.date]])
    .then((row) => {
      res.status(201).json({ id : row.insertId });
    })
    .catch(next)
    .done();
};


// PUT /exchange/:id
exports.update = function update(req, res, next) {
  var sql;

  sql =
    'UPDATE exchange_rate SET ? WHERE id = ?;';

  // should we even be changed the date?
  if (req.body.date) {
    req.body.date = new Date(req.body.date);
  }

  db.exec(sql, [req.body, req.params.id])
    .then(() => {
      sql =
      `SELECT
        exchange_rate.id, exchange_rate.enterprise_id, exchange_rate.currency_id, 
        exchange_rate.rate, exchange_rate.date, enterprise.currency_id AS enterprise_currency_id
      FROM exchange_rate
      JOIN enterprise ON enterprise.id = exchange_rate.enterprise_id
      WHERE exchange_rate.id = ?;`;

      return db.exec(sql, [req.params.id]);
    })
    .then((rows) => {
      if (rows.length === 0) {
        throw new NotFound(`Could not find an exchange rate with id ${req.params.id}`);
      }
      res.status(200).json(rows[0]);
    })
    .catch(next)
    .done();
};

// DELETE /exchange/:id
exports.delete = function del(req, res, next) {
  const sql =
    'DELETE FROM exchange_rate WHERE id = ?;';

  db.exec(sql, [req.params.id])
    .then((row) => {
    // if nothing happened, let the client know via a 404 error
      if (row.affectedRows === 0) {
        throw new NotFound(`Could not find an exchange rate with id ${req.params.id}`);
      }
      res.status(204).json();
    })
    .catch(next)
    .done();
};
