/**
 * Inventory Groups Controller
 * This controller is responsible for handling CRUD operations with inventory groups
 */

// requirements
const uuid = require('node-uuid');
const db = require('../../../lib/db');

// expose module's methods
exports.list    = list;
exports.details = details;
exports.create  = create;
exports.update  = update;

/** list inventory group */
function list () {
  'use strict';

  return getGroups();
}

/** details of inventory group */
function details (identifier) {
  'use strict';

  return getGroups(identifier);
}



/** create new inventory group */
function create (record) {
  'use strict';

  record.uuid = db.bid(record.uuid || uuid.v4());

  let sql = `INSERT INTO inventory_group SET ?;`;
  /*
   * return a promise which can contains result or error which is caught
   * in the main controller (inventory.js)
   */
  return db.exec(sql, [record])
  .then(() => uuid.unparse(record.uuid));
}

/** update an existing inventory group */
function update (record, identifier) {
  'use strict';

  let uid = db.bid(identifier);

  let sql = `UPDATE inventory_group SET ? WHERE uuid = ?;`;
  /*
   * return a promise which can contains result or error which is caught
   * in the main controller (inventory.js)
   */
  return db.exec(sql, [record, uid])
  .then(() => getGroups(identifier));
}

/**
 * Get list of inventory groups
 * @param {string} uid the group uuid is optional
 */
function getGroups(uid) {
  'use strict';

  let sql = `
    SELECT BUID(uuid) AS uuid, code, name, sales_account, cogs_account, stock_account
    FROM inventory_group
    `;

  uid = (uid) ? db.bid(uid) : undefined;
  sql += (uid) ? ' WHERE uuid = ?;' : ';';
  return db.exec(sql, [uid]);
}
