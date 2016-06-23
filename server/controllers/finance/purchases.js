/**
 * @module controllers/finance/purchases
 *
 * @description
 * This module provides an API interface for the Purchase API, responsible for
 * making purchase orders and quotes.
 *
 * @requires q
 * @requires node-uuid
 * @requires db
 * @requires NotFound
 * @requires BadRequest
 */

'use strict';

const q = require('q');
const uuid = require('node-uuid');
const db = require('./../../lib/db');
const NotFound = require('./../../lib/errors/NotFound');
const BadRequest = require('./../../lib/errors/BadRequest');

// create a new purchase order
exports.create = create;

// read all purchase order
exports.list = list;

// read a specific purchase order
exports.detail = detail;

// Update properties of a purchase Order
exports.update = update;


/**
 * @function linkPurchaseItems
 *
 * @description
 * Utility method to ensure purchase item lines reference the purchase
 * order and escape values as necessary
 *
 * @param {Array} items - an array of all purchase items to be written
 * @param {Blob} purchaseUuid - UUID of referenced purchase order
 * @returns {Array} - an array of all purchases items properly formatted
 */
function linkPurchaseItems(items, purchaseUuid) {

  // this columns array exists so that we are sure to order to columns in the
  // correct order
  const columns = [
    'uuid', 'inventory_uuid', 'quantity', 'unit_price', 'total', 'purchase_uuid'
  ];

  // loop through each item, making sure we have escapes and orderings correct
  return items.map(item => {

    // make sure that each item has a uuid by generate
    item.uuid = db.bid(item.uuid || uuid.v4());
    item.purchase_uuid = purchaseUuid;
    item.inventory_uuid = db.bid(item.inventory_uuid);

    // collapse sale items into array to be inserted into database
    return columns.map(key => item[key]);
  });
}

/**
 * @function lookupPurchaseOrder
 *
 * @description
 * Looks up a single purchase record and associated purchase_items
 *
 * @param {string} uid - the  UUID to be fetched from the database.
 * @return {Promise} - the database's promise result
 *
 * @private
 */
function lookupPurchaseOrder(uid) {
  let record;

  let sql = `
    SELECT BUID(p.uuid) AS uuid, CONCAT(pr.abbr, p.reference) AS reference,
      p.cost, p.date, s.name AS supplier, p.user_id,
      BUID(p.supplier_uuid) as supplier_uuid, p.note
    FROM purchase AS p
    JOIN supplier AS s ON s.uuid = p.supplier_uuid
    JOIN project AS pr ON p.project_id = pr.id
    WHERE p.uuid = ?;
  `;

  return db.exec(sql, [db.bid(uid)])
  .then(function (rows) {
    if (!rows.length) {
      throw new NotFound(`Could not find a purchase with uuid ${uid}`);
    }

    // store the record for return
    record = rows[0];

    sql = `
      SELECT BUID(pi.uuid) AS uuid, pi.quantity, pi.unit_price, pi.total, i.text
      FROM purchase_item AS pi
      JOIN inventory AS i ON i.uuid = pi.inventory_uuid
      WHERE pi.purchase_uuid = ?;
    `;

    return db.exec(sql, [db.bid(uid)]);
  })
  .then(function (rows) {

    // bind the purchase items to the "items" property and return
    record.items = rows;
    return record;
  });
}

/**
 * @method create
 *
 * @description
 * POST /purchases
 *
 * Creates a purchase order in the database
 */
function create(req, res, next) {
  let data = req.body;

  if (!data.items) {
    return next(
      new BadRequest('Cannot create a purchase order without purchase items.')
    );
  }

  // default to a new uuid if the client did not provide one
  const puid = data.uuid || uuid.v4();
  data.uuid = db.bid(puid);

  data = db.convert(data, ['supplier_uuid']);

  if (data.date) {
    data.date = new Date(data.date);
  }

  const sql =
    'INSERT INTO purchase SET ?';

  const itemSql = `
    INSERT INTO purchase_item
      (uuid, inventory_uuid, quantity, unit_price, total, purchase_uuid)
    VALUES ?;
  `;

  const items = linkPurchaseItems(data.items, data.uuid);

  // delete the purchase order items
  delete data.items;

  const transaction = db.transaction();

  transaction
    .addQuery(sql, [data])
    .addQuery(itemSql, [items]);

  transaction.execute()
    .then(function () {
      res.status(201).json({ uuid : puid });
    })
    .catch(next)
    .done();
}


/**
 * @method list
 *
 * @description
 * GET /purchases
 *
 * Returns the details of a single purchase order
 */
function list(req, res, next) {
  let sql;

  sql = `
    SELECT BUID(p.uuid) AS uuid, CONCAT(pr.abbr, p.reference) AS reference,
      p.cost, p.date, BUID(p.supplier_uuid) as supplier_uuid
    FROM purchase AS p
    JOIN supplier AS s ON s.uuid = p.supplier_uuid
    JOIN project AS pr ON p.project_id = pr.id;
  `;

  if (req.query.detailed === '1') {
    sql = `
      SELECT BUID(p.uuid) AS uuid, CONCAT(pr.abbr, p.reference) AS reference,
        p.cost, p.date, s.name AS supplier, p.user_id, p.note,
        BUID(p.supplier_uuid) as supplier_uuid
      FROM purchase AS p
      JOIN supplier AS s ON s.uuid = p.supplier_uuid
      JOIN project AS pr ON p.project_id = pr.id;
    `;
  }

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
 * @method detail
 *
 * @description
 * GET /purchases/:uuid
 *
 * Returns a detailed list of the purchase order, suitable for a report.
 */
function detail(req, res, next) {
  lookupPurchaseOrder(req.params.uuid)
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}

/**
 * @method update
 *
 * @description
 * PUT /purchases/:uuid
 *
 * Updates a purchase order in the database.
 */
function update(req, res, next) {
  const sql =
    'UPDATE purchase SET ? WHERE uuid = ?;';

  const data = db.convert(req.body, ['supplier_uuid']);

  // protect from updating the purchase's uuid
  delete data.uuid;

  db.exec(sql, [req.body, db.bid(req.params.uuid)])
  .then(function () {
    return lookupPurchaseOrder(req.params.uuid);
  })
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}
