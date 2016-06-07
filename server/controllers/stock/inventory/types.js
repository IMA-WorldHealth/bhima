/**
 * Inventory Types Controller
 * This controller is responsible for handling CRUD operations with inventory types
 */

// requirements
const db = require('../../../lib/db');

// expose module's methods
exports.list    = list;
exports.details = details;
exports.create  = create;
exports.update  = update;

/** list inventory type */
function list () {
  'use strict';

  return getTypes();
}

/** details of inventory type */
function details (identifier) {
  'use strict';

  return getTypes(identifier);
}



/** create new inventory type */
function create (record) {
  'use strict';

  let sql = `INSERT INTO inventory_type SET ?;`;
  /*
   * return a promise which can contains result or error which is caught
   * in the main controller (inventory.js)
   */
  return db.exec(sql, [record])
  .then(row => row.insertId);
}

/** update an existing inventory type */
function update (record, id) {
  'use strict';

  let sql = `UPDATE inventory_type SET ? WHERE id = ?;`;
  /*
   * return a promise which can contains result or error which is caught
   * in the main controller (inventory.js)
   */
  return db.exec(sql, [record, id])
  .then(() => getTypes(id));
}

/**
 * Get list of inventory types
 * @param {string} uid the type id is optional
 */
function getTypes(id) {
  'use strict';

  let sql = `SELECT id, text FROM inventory_type `;
  sql += (id) ? ' WHERE id = ?;' : ';';
  return db.exec(sql, [id]);
}
