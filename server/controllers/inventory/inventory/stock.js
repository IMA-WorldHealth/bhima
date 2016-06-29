
var db = require('../../../lib/db');

exports.getStockLevels = getStockLevels;
exports.getStockLevelsById = getStockLevelsById;
exports.getAverageStockLevels = getAverageStockLevels;
exports.getAverageStockLevelsById = getAverageStockLevelsById;

/* -------------------------------------------------------------------------- */

/**
* Compute the current stock (entries - consumption) for all inventory items in
* the enterprise.
*
* @function getStockLevels
* @param {Object} options Filtering options for the SQL query
* @returns {Promise} The database request promise
*/
function getStockLevels(options) {
  'use strict';

  var sql;

  // We do a LEFT JOIN here because stock and consumption are related by a
  // tracking number.  For every consumption event, there was an initial stock
  // entry, so we should be able to capture all stock entry and consumption
  // events with this LEFT JOIN.
  //
  // TODO - is this optimal?
  sql =
    `SELECT i.uuid AS uuid, IFNULL(t.quantity, 0) AS quantity
    FROM inventory AS i LEFT JOIN (
      SELECT s.inventory_uuid AS uuid,
        SUM(s.quantity - c.quantity) AS quantity
      FROM stock AS s LEFT JOIN consumption AS c ON
        s.tracking_number = c.tracking_number
      WHERE c.canceled <> 1
      GROUP BY s.inventory_uuid
    ) AS t ON i.uuid = t.uuid
    GROUP BY i.uuid;`;

  return db.exec(sql);
}

/**
* Compute the current stock (entries - consumption) for a single inventory item.
*
* @function getStockLevelsById
* @param {Object} options Filtering options for the SQL query
* @returns {Promise} The database request promise
*/
function getStockLevelsById(uuid, options) {
  'use strict';

  var sql;

  sql =
    `SELECT s.inventory_uuid, SUM(s.quantity - IFNULL(c.quantity, 0)) AS quantity
    FROM stock AS s LEFT JOIN consumption AS c ON
      s.tracking_number = c.tracking_number
    WHERE s.inventory_uuid = ?
    GROUP BY s.inventory_uuid;`;

  return db.exec(sql, [uuid]);
}


/**
* Compute the average stock quantity (entries - consumption) for all inventory
* items over time.
*
* @function getAverageStockLevelsById
* @param {Object} options Filtering options for the SQL query
* @returns {Promise} The database request promise
*/
function getAverageStockLevels(options) {
  'use strict';

  var sql;

  // TODO - figure out dates

  sql =
    `SELECT s.inventory_uuid AS uuid, 
      SUM(s.quantity - c.quantity) AS quantity
    FROM stock AS s LEFT JOIN consumption AS c ON
      s.tracking_number = c.tracking_number
    WHERE c.canceled <> 1 AND s.inventory_uuid = ?
    GROUP BY s.inventory_uuid;`;

  return db.exec(sql, []);
}

/**
*
* Compute the average stock quantity (entries - consumption) for a single
* inventory item over time.
*
* @function getStockLevelsById
* @param {Object} options Filtering options for the SQL query
* @returns {Promise} The database request promise
*/
function getAverageStockLevelsById(uuid, options) {
  'use strict';

  // TODO
}
