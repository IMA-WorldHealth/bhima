/**
 * Inventory Units Controller
 * This controller is responsible for handling CRUD operations with inventory units
 */

const db = require('../../../lib/db');

// expose module's methods
exports.list = list;
exports.details = details;
exports.create = create;
exports.update = update;
exports.remove = remove;

/** list inventory unit */
function list() {
  return getUnits();
}

/** details of inventory unit */
function details(identifier) {
  return getUnits(identifier);
}


/** create new inventory unit */
function create(record) {
  const sql = 'INSERT INTO inventory_unit (text) VALUES (?);';
  /*
   * return a promise which can contains result or error which is caught
   * in the main controller (inventory.js)
   */
  return db.exec(sql, [record.text])
    .then(row => row.insertId);
}

/** update an existing inventory unit */
function update(record, id) {
  const sql = 'UPDATE inventory_unit SET ? WHERE id = ?;';
  /*
   * return a promise which can contains result or error which is caught
   * in the main controller (inventory.js)
   */
  return db.exec(sql, [record, id])
    .then(() => getUnits(id));
}

/** remove inventory unit */
function remove(id) {
  const sql = 'DELETE FROM inventory_unit WHERE id = ?;';
  return db.exec(sql, [id]);
}

/**
 * Get list of inventory units
 * @param {number} id - the unit id is optional
 */
function getUnits(id) {
  const sql = `SELECT id, text FROM inventory_unit ${id ? ' WHERE id = ?;' : ';'}`;
  return db.exec(sql, [id]);
}
