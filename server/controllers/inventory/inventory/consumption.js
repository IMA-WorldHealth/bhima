/*
* Inventory Consumption Functions
*
* This controller is responsible for calculating consumption rates
* for different inventory items over given time periods.
*/

var q = require('q'),
    db = require('../../../lib/db');

// exports
exports.getItemConsumption = getItemConsumption;
exports.getAverageItemConsumption = getAverageItemConsumption;

/**
* Extracts consumption data for a particular inventory item identified by a
* uuid.
*
* @function getItemConsumption
* @param {String} uuid Inventory item identifier
* @param {Object} options An object derived from the URL query string
* @returns {Promise} Returns a database query
*/
function getItemConsumption(uuid, options) {
  'use strict';

  var sql, groupby, where,
      group = options.group,
      start = options.start,
      end   = options.end;

  // pre-format queries
  where = start ? 'c.date BETWEEN DATE(?) AND DATE(?) '  : '1 ';

  switch (group) {
    case 'year':
      sql =
        `SELECT SUM(IF(c.canceled, 0, c.quantity)) AS quantity, DATE_FORMAT(c.date, '%Y-%m-%d') AS 'date' 
        FROM consumption AS c JOIN stock AS s JOIN inventory AS i
          ON c.tracking_number = s.tracking_number AND
          s.inventory_uuid = i.uuid
        WHERE i.uuid = ? AND ${where}
        GROUP BY i.uuid, YEAR(c.date)`;
      break;

    case 'month':
      sql =
        `SELECT SUM(IF(c.canceled, 0, c.quantity)) AS quantity, DATE_FORMAT(c.date, '%Y-%m-01') AS 'date'
        FROM consumption AS c JOIN stock AS s JOIN inventory AS i
          ON c.tracking_number = s.tracking_number AND
          s.inventory_uuid = i.uuid
        WHERE i.uuid = ? AND ${where}
        GROUP BY i.uuid, YEAR(c.date), MONTH(c.date)`;
      break;

    case 'week' :
      sql =
        `SELECT SUM(IF(c.canceled, 0, c.quantity)) AS quantity, c.date
        FROM consumption AS c JOIN stock AS s JOIN inventory AS i
          ON c.tracking_number = s.tracking_number AND
          s.inventory_uuid = i.uuid
        WHERE i.uuid = ? AND ${where}
        GROUP BY i.uuid, YEAR(c.date), MONTH(c.date), WEEK(c.date)`;
      break;

    default:
      sql =
        `SELECT SUM(IF(c.canceled, 0, c.quantity)) AS quantity, DATE(c.date) AS 'date'
        FROM consumption AS c JOIN stock AS s JOIN inventory AS i
          ON c.tracking_number = s.tracking_number AND
          s.inventory_uuid = i.uuid
        WHERE i.uuid = ? AND ${where}
        GROUP BY i.uuid, DATE(c.date)`;
      break;
  }

  return db.exec(sql, [uuid, start, end]);
}

/**
* Extracts average consumption data for a particular inventory item identified
* by a uuid.
*
* @function getAverageItemConsumption
* @param {String} uuid Inventory item identifier
* @param {Object} options An object derived from the URL query string
* @returns {Promise} returns a database query
*/
function getAverageItemConsumption(uuid, options) {
  'use strict';

  var sql, difference, where, params,
      start = options.start,
      end = options.end;

  // pre-format queries
  where = start ? 'c.date BETWEEN DATE(?) AND DATE(?) '  : '1 ';
  difference = start ?
    'DATE(?), DATE(?)' :
    'CURDATE(), MIN(c.date)';
  params = start ? [end, start, uuid, start, end] : [uuid];

  // if the user has predefined a date range, we will compute the consumption
  // over that date range.  Otherwise, use the available date.
  //
  // The implicit assumption is that the user knows when they should have had
  // stock, and will pick sensible dates.  If the user is unsure, do not pick
  // specific dates -- the average will then be computed over the date range
  // spanned by the observed consumptions.
  //
  // We add one to the DATEDIFF to prevent division by 0
  sql =
    `SELECT SUM(c.quantity) / (DATEDIFF(${difference}) + 1) AS average
    FROM (
      SELECT i.uuid, c.quantity, c.date
      FROM consumption AS c JOIN stock AS s JOIN inventory AS i
        ON c.tracking_number = s.tracking_number AND
        s.inventory_uuid = i.uuid
      WHERE c.canceled <> 1 AND i.uuid = ? AND ${where}
    ) AS c
    GROUP BY c.uuid;`;

  return db.exec(sql, params);
}
