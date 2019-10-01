/*
* Inventory Core Functions
*
* This file contains utility functions for common operations and common error
* handling.
*/

const _ = require('lodash');
const { uuid } = require('../../../lib/util');
const db = require('../../../lib/db');
const FilterParser = require('../../../lib/filter');

// this should be a const in future ES versions
const errors = {
  MISSING_PARAMETERS : {
    httpStatus : 400,
    code       : 'ERR_MISSING_PARAMETERS',
    reason     : 'When using date ranges, you must provide both a start and end date.',
  },

  NO_INVENTORY_ITEMS : {
    httpStatus : 404,
    code       : 'ERR_NO_INVENTORY_ITEMS',
    reason     : 'No inventory items were found in the database query.',
  },

  NO_INVENTORY_ITEM : {
    httpStatus : 404,
    code       : 'ERR_NO_INVENTORY_ITEM',
    reason     : 'The inventory uuid requested was not found in the database.',
  },

  NO_STOCK : {
    httpStatus : 404,
    code       : 'ERR_NO_STOCK',
    reason     : 'No stock was found for the provided inventory uuid.',
  },
};

exports.getIds = getIds;
exports.getItemsMetadata = getItemsMetadata;
exports.getItemsMetadataById = getItemsMetadataById;
exports.createItemsMetadata = createItemsMetadata;
exports.updateItemsMetadata = updateItemsMetadata;
exports.hasBoth = hasBoth;
exports.errors = errors;
exports.errorHandler = errorHandler;
exports.remove = remove;
exports.inventoryLog = inventoryLog;

/**
* Create inventory metadata in the database
*
* @function createItemsMetadata
* @return {Promise} Returns a database query promise
*/
async function createItemsMetadata(record, session) {
  const recordCopy = _.clone(record);
  record.enterprise_id = session.enterprise.id;
  const recordUuid = record.uuid || uuid();
  record.uuid = db.bid(recordUuid);
  record.group_uuid = db.bid(record.group_uuid);

  const sql = 'INSERT INTO inventory SET ?;';
  const inventoryLogSql = 'INSERT INTO inventory_log SET ?;';

  const current = _.extend({}, { action : 'CREATION' }, recordCopy, await loadGroupAndType(record));
  const transaction = db.transaction();

  transaction.addQuery(sql, [record]);

  transaction.addQuery(inventoryLogSql, {
    uuid : db.uuid(),
    inventory_uuid : db.bid(recordUuid),
    text : JSON.stringify({ action : 'CREATION', current, last : {} }),
    user_id : session.user.id,
  });

  /*
   * return a promise which can contains result or error which is caught
   * in the main controller (inventory.js)
  */
  return transaction.execute().then(() => recordUuid);
}

async function loadGroupAndType(record) {
  const data = {};
  if (record.type_id) {
    data.inventoryType = await db.one(`SELECT text from inventory_type where id =?`, record.type_id);
  }

  if (record.group_uuid) {
    data.inventoryGroup = await db.one(`SELECT name from inventory_group where uuid =?`, record.group_uuid);
  }

  if (record.unit_id) {
    data.inventoryUnit = await db.one(`SELECT text from inventory_unit where id =?`, record.unit_id);
  }

  return data;
}
/**
* Update inventory metadata in the database
*
* @function updateItemsMetadata
* @return {Promise} Returns a database query promise
*/
async function updateItemsMetadata(record, identifier, session) {
  // remove the uuid if it exists
  delete record.uuid;
  const recordCopy = _.clone(record);
  if (record.group_uuid) {
    record.group_uuid = db.bid(record.group_uuid);
  }


  const sql = 'UPDATE inventory SET ? WHERE uuid = ?;';
  // if there is no property to update this query won't work

  if (_.isEmpty(record)) { // there is no change, but user has submitted
    return getItemsMetadataById(identifier);
  }

  const inventoryLogSql = 'INSERT INTO inventory_log SET ?';
  const transaction = db.transaction();

  // @lastInfo inventory informations before update
  const lastInfo = await getItemsMetadataById(identifier);

  const othersKyes = await loadGroupAndType(record);

  const current = _.extend({}, recordCopy, othersKyes);

  transaction.addQuery(sql, [record, db.bid(identifier)]);
  transaction.addQuery(inventoryLogSql, {
    uuid : db.uuid(),
    inventory_uuid : db.bid(identifier),
    text : JSON.stringify({ action : 'UPDATE', last : lastInfo, current }),
    user_id : session.user.id,
  });

  /*
   * return a promise which can contains result or error which is caught
   * in the main controller (inventory.js)
  */

  return transaction.execute().then(() => getItemsMetadataById(identifier));
}

/**
* Find all inventory UUIDs in the database.
*
* @function getItemIds
* @return {Promise} Returns a database query promise
*/
function getIds() {
  // TODO - should we be filtering on enterprise id in these queries?
  const sql = 'SELECT i.uuid FROM inventory AS i;';

  return db.exec(sql);
}

/**
* This function finds inventory metadata for all recorded inventory items.  The
* result is a JSON with inventory stock, type, and unit information.
*
* @function getItemsMetadata
* @return {Promise} Returns a database query promise
*/
function getItemsMetadata(params) {
  db.convert(params, ['inventory_uuids', 'uuid', 'group_uuid']);
  const filters = new FilterParser(params, { tableAlias : 'inventory', autoParseStatements : false });

  const sql = `SELECT BUID(inventory.uuid) as uuid, inventory.code, inventory.text AS label, inventory.price, iu.abbr AS unit,
      it.text AS type, ig.name AS groupName, BUID(ig.uuid) AS group_uuid, ig.expires, ig.unique_item, inventory.consumable,inventory.locked, inventory.stock_min,
      inventory.stock_max, inventory.created_at AS timestamp, inventory.type_id, inventory.unit_id,
      inventory.note,  inventory.unit_weight, inventory.unit_volume,
      ig.sales_account, ig.stock_account, ig.donation_account, inventory.sellable, inventory.note,
      inventory.unit_weight, inventory.unit_volume, ig.sales_account, ig.stock_account, ig.donation_account,
      ig.cogs_account, inventory.default_quantity
    FROM inventory JOIN inventory_type AS it
      JOIN inventory_unit AS iu JOIN inventory_group AS ig ON
      inventory.type_id = it.id AND inventory.group_uuid = ig.uuid AND
      inventory.unit_id = iu.id`;

  filters.fullText('text', 'text', 'inventory');

  filters.equals('uuid');
  filters.equals('group_uuid');
  filters.equals('unit_id');
  filters.equals('type_id');
  filters.equals('code');
  filters.equals('price');
  filters.equals('consumable');
  filters.equals('locked');
  filters.equals('label');
  filters.equals('sellable');
  filters.equals('note');

  filters.custom('inventory_uuids', 'inventory.uuid IN (?)', params.inventory_uuids);
  filters.setOrder('ORDER BY inventory.code ASC');

  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();
  return db.exec(query, parameters);
}


// This function helps to delete an invetory

function remove(_uuid) {
  const sql = `DELETE FROM inventory WHERE uuid = HUID(?)`;
  return db.exec(sql, _uuid);
}

/**
* This function finds inventory metadata for a particular inventory item.  The
* result is a JSON with inventory stock, type, and unit information.
*
* @function getItemMetadata
* @param {String} uuid The inventory item identifier
* @return {Promise} Returns a database query promise
*/
function getItemsMetadataById(uid) {
  const sql = `SELECT BUID(i.uuid) as uuid, i.code, i.text AS label, i.price, iu.abbr AS unit,
      it.text AS type, ig.name AS groupName, BUID(ig.uuid) AS group_uuid, ig.expires, ig.unique_item, i.consumable, i.locked, i.stock_min,
      i.stock_max, i.created_at AS timestamp, i.type_id, i.unit_id, i.unit_weight, i.unit_volume,
      ig.sales_account, i.default_quantity, i.avg_consumption, i.delay, i.purchase_interval, i.last_purchase, i.num_purchase
    FROM inventory AS i JOIN inventory_type AS it
      JOIN inventory_unit AS iu JOIN inventory_group AS ig ON
      i.type_id = it.id AND i.group_uuid = ig.uuid AND
      i.unit_id = iu.id
    WHERE i.uuid = ?;`;

  return db.one(sql, [db.bid(uid), uid, 'inventory']);
}


/**
* Coerces values in to truth-y and false-y values.  Returns true if
* the result is equivalent.
*
* @function hasBoth
* @param m any value
* @param n any value
* @return {Boolean} Returns true if m and n are both truthy or both falsey
*/
function hasBoth(m, n) {
  return !m === !n;
}

/**
* Configures and sends appropriate HTTP error codes and information for repeat
* error cases throughout the module.
*
* @function errorHandler
* @param error An error object
* @param req ExpressJS req object
* @param res ExpressJS res object
* @param next ExpressJS's next function
*/
function errorHandler(error, req, res, next) {
  if (error.httpStatus !== undefined) {
    res.status(error.httpStatus).json(error);
  } else {
    next(error);
  }
}

function inventoryLog(inventoryUuid) {
  const sql = `
    SELECT ivl.text, ivl.log_timestamp, user.display_name as userName
    FROM inventory_log ivl
    JOIN user on user.id = ivl.user_id
    WHERE ivl.inventory_uuid=?
    ORDER BY ivl.log_timestamp ASC
  `;
  return db.exec(sql, db.bid(inventoryUuid));
}
