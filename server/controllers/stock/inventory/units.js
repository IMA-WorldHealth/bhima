/**
 * Inventory Units Controller
 * This controller is responsible for handling CRUD operations with inventory units
 */

// requirements
const db = require('../../../lib/db');

// expose module's methods
exports.list    = list;
exports.details = details;
exports.create  = create;
exports.update  = update;
exports.remove  = remove;

/** list inventory unit */
function list () {
  'use strict';

  return getUnits();
}

/** details of inventory unit */
function details (identifier) {
  'use strict';

  return getUnits(identifier);
}



/** create new inventory unit */
function create (record) {
  'use strict';

  let sql = `INSERT INTO inventory_unit SET ?;`;
  /*
   * return a promise which can contains result or error which is caught
   * in the main controller (inventory.js)
   */
  return db.exec(sql, [record])
  .then(row => row.insertId);
}

/** update an existing inventory unit */
function update (record, id) {
  'use strict';

  let sql = `UPDATE inventory_unit SET ? WHERE id = ?;`;
  /*
   * return a promise which can contains result or error which is caught
   * in the main controller (inventory.js)
   */
  return db.exec(sql, [record, id])
  .then(() => getUnits(id));
}

/** remove inventory unit */
function remove (id) {
  'use strict';

  let sql = 'DELETE FROM inventory_unit WHERE id = ?;';
  return db.exec(sql, [id]);
}

/**
 * Get list of inventory units
 * @param {string} uid the unit id is optional
 */
function getUnits(id) {
  'use strict';

  let sql = `SELECT id, text FROM inventory_unit `;
  sql += (id) ? ' WHERE id = ?;' : ';';
  return db.exec(sql, [id]);
}
