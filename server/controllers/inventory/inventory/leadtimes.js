/**
* This module calculates the delay in stock reordering due to time in transit.
* These times are also known as 'lead times' for stock.
*/

var db = require('../../../lib/db');

exports.getInventoryLeadTimes= getInventoryLeadTimes;
exports.getInventoryLeadTimesById = getInventoryLeadTimesById;

/**
* Calculates the lead time for all inventory items carried by the enterprise.
*
* @function getInventoryLeadTimes
* @param {String} uuid Inventory item identifier
* @param {Object} options An object derived from the URL query string
* @returns {Promise} Returns a database query
*/
function getInventoryLeadTimes(options) {
  'use strict';

  var sql;

  sql =
    `SELECT i.uuid, ROUND(AVG(CEIL(DATEDIFF(s.entry_date, p.purchase_date)))) AS days
    FROM purchase AS p JOIN stock AS s JOIN purchase_item AS z JOIN inventory AS i ON
      p.uuid = s.purchase_order_uuid AND
      s.inventory_uuid = i.uuid AND
      p.uuid = z.purchase_uuid
    WHERE z.inventory_uuid = s.inventory_uuid;`;

  return db.exec(sql);
}

/**
* Calculates the lead time for all a given inventory item provided by the ID
*
* @function getInventoryLeadTimesById
* @param {String} uuid Inventory item identifier
* @param {Object} options An object derived from the URL query string
* @returns {Promise} Returns a database query
*/
function getInventoryLeadTimesById(uuid, options) {
  'use strict';
  // TODO
  var sql;

  sql =
    `SELECT ROUND(AVG(CEIL(DATEDIFF(s.entry_date, p.purchase_date)))) AS days
    FROM purchase AS p JOIN stock AS s JOIN purchase_item AS z JOIN inventory AS i ON
      p.uuid = s.purchase_order_uuid AND
      s.inventory_uuid = i.uuid AND
      p.uuid = z.purchase_uuid
    WHERE z.inventory_uuid = s.inventory_uuid AND i.uuid = ?;`;

  return db.exec(sql, [uuid]);
}
