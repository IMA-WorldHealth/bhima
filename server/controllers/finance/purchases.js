/**
 * @module controllers/finance/purchases
 *
 * @description
 * This module provides an API interface for the Purchase API, responsible for
 * making purchase orders and quotes.
 *
 * @requires node-uuid
 * @requires db
 * @requires NotFound
 * @requires BadRequest
 */

const uuid = require('node-uuid');

const db = require('../../lib/db');
const BadRequest = require('../../lib/errors/BadRequest');

const identifiers = require('../../config/identifiers');
const FilterParser = require('../../lib/filter');

// create a new purchase order
exports.create = create;

// read all purchase order
exports.list = list;

// read a specific purchase order
exports.detail = detail;

// Update properties of a purchase Order
exports.update = update;

// allows other controller to benefit from the lookup method
exports.lookup = lookupPurchaseOrder;

// search purchases
exports.search = search;

// purchase status in stock
exports.stockStatus = purchaseStatus;

// purchase balance
exports.stockBalance = purchaseBalance;

exports.find = find;

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
    'uuid', 'inventory_uuid', 'quantity', 'unit_price', 'total', 'purchase_uuid',
  ];

  // loop through each item, making sure we have escapes and orderings correct
  return items.map((item) => {
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
    SELECT BUID(p.uuid) AS uuid,
      CONCAT_WS('.', '${identifiers.PURCHASE_ORDER.key}', pr.abbr, p.reference) AS reference,
      p.cost, p.date, s.display_name  AS supplier, p.user_id,
      BUID(p.supplier_uuid) as supplier_uuid, p.note, u.display_name AS author,
      p.is_confirmed, p.is_received, p.is_cancelled, p.is_partially_received
    FROM purchase AS p
    JOIN project ON p.project_id = project.id
    JOIN supplier AS s ON s.uuid = p.supplier_uuid
    JOIN project AS pr ON p.project_id = pr.id
    JOIN user AS u ON u.id = p.user_id
    WHERE p.uuid = ?;
  `;

  return db.one(sql, [db.bid(uid), uid, 'Purchase Order'])
    .then((row) => {
      record = row;

      sql = `
        SELECT BUID(pi.uuid) AS uuid, pi.quantity, pi.unit_price, pi.total,
          BUID(pi.inventory_uuid) AS inventory_uuid, i.text
        FROM purchase_item AS pi
        JOIN inventory AS i ON i.uuid = pi.inventory_uuid
        WHERE pi.purchase_uuid = ?;
      `;

      return db.exec(sql, [db.bid(uid)]);
    })
    .then((rows) => {
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

  data.user_id = req.session.user.id;
  data.project_id = req.session.project.id;
  data.currency_id = req.session.enterprise.currency_id;

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
  delete data.reference;

  const transaction = db.transaction();

  transaction
    .addQuery(sql, [data])
    .addQuery(itemSql, [items]);

  return transaction.execute()
    .then(() => {
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
  find(req.query)
  .then(rows => res.status(200).json(rows))
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
    .then((record) => {
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
    .then(() => lookupPurchaseOrder(req.params.uuid))
    .then(record => res.status(200).json(record))
    .catch(next)
    .done();
}

/**
 * @method search
 * @description search purchases by some filters given
 */
function search(req, res, next) {
  find(req.query)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
 * @method find
 *
 * @description
 * This method will apply filters from the options object passed in to
 * filter the purchase orders.
 */
function find(options) {
  // ensure epected options are parsed appropriately as binary
  db.convert(options, ['supplier_uuid']);
  const filters = new FilterParser(options, { tableAlias : 'p', autoParseStatements : false  });

  // default purchase date
  filters.period('period', 'date');
  filters.dateFrom('custion_period_start', 'date');
  filters.dateTo('custom_period_end', 'date');
  filters.equals('user_id');
  filters.equals('is_confirmed');
  filters.equals('is_received');
  filters.equals('is_cancelled');
  filters.equals('supplier_uuid', 'uuid', 's');

  const sql = `
    SELECT BUID(p.uuid) AS uuid,
        CONCAT_WS('.', '${identifiers.PURCHASE_ORDER.key}', pr.abbr, p.reference) AS reference,
        p.cost, p.date, s.display_name  AS supplier, p.user_id, p.note,
        BUID(p.supplier_uuid) as supplier_uuid, u.display_name AS author,
        p.is_confirmed, p.is_received, p.is_cancelled, p.is_partially_received
      FROM purchase AS p
      JOIN supplier AS s ON s.uuid = p.supplier_uuid
      JOIN project AS pr ON p.project_id = pr.id
      JOIN user AS u ON u.id = p.user_id
  `;

  const referenceStatement = `CONCAT_WS('.', '${identifiers.PURCHASE_ORDER.key}', pr.abbr, p.reference) = ?`;
  filters.custom('reference', referenceStatement);
  filters.setOrder('ORDER BY p.date DESC');

  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();

  return db.exec(query, parameters);
}

/**
 * GET /purchases/:uuid/stock_status
 *
 * @description
 * This method return the updated status of purchase order
 * if it is completed or partially entered
 */
function purchaseStatus(req, res, next) {
  const status = {};
  const FROM_PURCHASE_ID = 1;
  const purchaseUuid = db.bid(req.params.uuid);
  const sql = `
    SELECT IFNULL(SUM(m.quantity * m.unit_cost), 0) AS movement_cost, p.cost
    FROM stock_movement m
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN purchase p ON p.uuid = l.origin_uuid
    WHERE p.uuid = ? AND m.flux_id = ? AND m.is_exit = 0;
  `;

  db.one(sql, [purchaseUuid, FROM_PURCHASE_ID])
  .then((row) => {
    let query = '';
    status.cost = row.cost;
    status.movement_cost = row.movement_cost;

    if (row.movement_cost === row.cost) {
      // the purchase is totally delivered
      status.status = 'full_entry';
      query = 'UPDATE purchase SET is_partially_received = 0, is_received = 1 WHERE uuid = ?';
    } else if (row.movement_cost > 0 && row.movement_cost < row.cost) {
      // the purchase is partially delivered
      status.status = 'partial_entry';
      query = 'UPDATE purchase SET is_partially_received = 1, is_received = 0 WHERE uuid = ?';
    } else if (row.movement_cost === 0) {
      // the purchase is not yet delivered
      status.status = 'no_entry';
      query = 'UPDATE purchase SET is_partially_received = 0, is_received = 0 WHERE uuid = ?';
    }
    return db.exec(query, [purchaseUuid]);
  })
  .then(() => res.status(200).send(status))
  .catch(next)
  .done();
}

/**
 * GET /purchases/:uuid/stock_balance
 *
 * @description
 * This method return the balance of a purchase to know
 * the amount and inventories which are already entered.
 */
function purchaseBalance(req, res, next) {
  const FROM_PURCHASE_ID = 1;
  const purchaseUuid = db.bid(req.params.uuid);
  const sql = `
    SELECT
      s.display_name, u.display_name, BUID(p.uuid) AS uuid,
      CONCAT_WS('.', '${identifiers.PURCHASE_ORDER.key}', proj.abbr, p.reference) AS reference, p.date,
      BUID(pi.inventory_uuid) AS inventory_uuid, pi.quantity, pi.unit_price,
      IFNULL(distributed.quantity, 0) AS distributed_quantity,
      (pi.quantity - IFNULL(distributed.quantity, 0)) AS balance
    FROM purchase p
    JOIN purchase_item pi ON pi.purchase_uuid = p.uuid
    JOIN project proj ON proj.id = p.project_id
    JOIN supplier s ON s.uuid = p.supplier_uuid
    JOIN user u ON u.id = p.user_id
    LEFT JOIN
    (
      SELECT l.label, SUM(IFNULL(m.quantity, 0)) AS quantity, l.inventory_uuid, l.origin_uuid
      FROM stock_movement m
        JOIN lot l ON l.uuid = m.lot_uuid
        JOIN inventory i ON i.uuid = l.inventory_uuid
      WHERE m.flux_id = ? AND m.is_exit = 0 AND l.origin_uuid = ?
      GROUP BY l.origin_uuid, l.inventory_uuid
    ) AS distributed ON distributed.inventory_uuid = pi.inventory_uuid AND distributed.origin_uuid = p.uuid
    WHERE p.uuid = ? HAVING balance > 0 AND balance <= pi.quantity
  `;

  db.exec(sql, [FROM_PURCHASE_ID, purchaseUuid, purchaseUuid])
  .then(rows => res.status(200).json(rows))
  .catch(next)
  .done();
}
