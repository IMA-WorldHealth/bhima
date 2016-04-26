
var db = require('../../../lib/db');

exports.getExpirations = getExpirations;
exports.getExpirationsById = getExpirationsById;

/**
* Compute all stock expiring within a given date range.
*
* @function getExpirations
* @param {Object} options Filtering options for the SQL query
* @returns {Promise} The database request promise
*/
function getExpirations(options) {
  var sql;

  sql =
    `SELECT stock.inventory_uuid, stock.lot_number, stock.quantity,
      stock.expiration_date, inventory.text
    FROM stock JOIN inventory ON stock.inventory_uuid = inventory.uuid
    WHERE DATE(stock.expiration_date) BETWEEN DATE(?) AND DATE(?) AND
      stock.quantity > 0;`;

  return db.exec(sql, [options.start, options.end]);
}

/**
* Compute all stock expiring within a given date range by inventory item ID.
*
* @function getExpirations
* @param {Object} options Filtering options for the SQL query
* @returns {Promise} The database request promise
*/
function getExpirationsById(uuid, options) {
  var sql;

  sql =
    `SELECT stock.inventory_uuid, stock.lot_number, stock.quantity,
      stock.expiration_date, inventory.text
    FROM stock JOIN inventory ON stock.inventory_uuid = inventory.uuid
    WHERE stock.inventory_uuid = ? AND
      DATE(stock.expiration_date) BETWEEN DATE(?) AND DATE(?) AND
      stock.quantity > 0;`;

  return db.exec(sql, [uuid, options.start, options.end]);
}
