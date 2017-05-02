/**
 * Inventory Types Controller
 * This controller is responsible for handling CRUD operations with inventory types
 */

// requirements
const db = require('../../../lib/db');

// expose module's methods
exports.list = list;
exports.details = details;
exports.create = create;
exports.update = update;
exports.remove = remove;

/** list inventory type */
function list() {
  return getTypes();
}

/** details of inventory type */
function details(identifier) {
  return getTypes(identifier);
}


/** create new inventory type */
function create(record) {
  const sql = 'INSERT INTO inventory_type (text) VALUES (?);';
  /*
   * return a promise which can contains result or error which is caught
   * in the main controller (inventory.js)
   */
  return db.exec(sql, [record.text])
    .then(row => row.insertId);
}

/** update an existing inventory type */
function update(record, id) {
  const sql = 'UPDATE inventory_type SET ? WHERE id = ?;';
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
  const sql = `SELECT id, text FROM inventory_type ${id ? ' WHERE id = ?' : ''};`;
  return db.exec(sql, [id]);
}

/** remove inventory type */
function remove(id) {
  const sql = 'DELETE FROM inventory_type WHERE id = ?;';
  return db.exec(sql, [id]);
}
