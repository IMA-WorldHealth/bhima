/**
 * @module controllers/finance/purchases
 *
 * @description
 * This module provides an API interface for the Purchase API, responsible for
 * making purchase orders and quotes.
 *
 * @requires lib/util
 * @requires db
 * @requires NotFound
 * @requires BadRequest
 * @requires moment
 */

const q = require('q');
const moment = require('moment');

const { uuid } = require('../../lib/util');
const db = require('../../lib/db');
const barcode = require('../../lib/barcode');
const BadRequest = require('../../lib/errors/BadRequest');

const identifiers = require('../../config/identifiers');
const FilterParser = require('../../lib/filter');
const util = require('../../lib/util');

// See the schema for purchase_status and the value of
// PURCHASES.STATUS.CONFIRMED in the bhima.sql data
const PURCHASE_STATUS_CONFIRMED_ID = 2;

const entityIdentifier = identifiers.PURCHASE_ORDER.key;

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

// purchase state
exports.purchaseState = purchaseState;

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
    item.uuid = db.bid(item.uuid || uuid());
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
    SELECT BUID(p.uuid) AS uuid, dm.text as reference,
      p.cost, p.date, s.display_name  AS supplier, p.user_id,
      BUID(p.supplier_uuid) as supplier_uuid, p.note, u.display_name AS author,
      p.status_id, ps.text AS status
    FROM purchase AS p
    JOIN document_map dm ON p.uuid = dm.uuid
    JOIN project ON p.project_id = project.id
    JOIN supplier AS s ON s.uuid = p.supplier_uuid
    JOIN project AS pr ON p.project_id = pr.id
    JOIN user AS u ON u.id = p.user_id
    JOIN purchase_status AS ps ON ps.id = p.status_id
    WHERE p.uuid = ?;
  `;

  return db.one(sql, [db.bid(uid), uid, 'Purchase Order'])
    .then((row) => {
      record = row;

      sql = `
        SELECT BUID(pi.uuid) AS uuid, pi.quantity, pi.unit_price, pi.total,
          BUID(pi.inventory_uuid) AS inventory_uuid, i.text, i.code,
          iu.text as unit
        FROM purchase_item AS pi
          JOIN inventory AS i ON i.uuid = pi.inventory_uuid
          JOIN inventory_unit AS iu ON iu.id = i.unit_id
        WHERE pi.purchase_uuid = ?;
      `;

      return db.exec(sql, [db.bid(uid)]);
    })
    .then((rows) => {
      // bind the purchase items to the "items" property and return
      record.items = rows;
      record.barcode = barcode.generate(entityIdentifier, record.uuid);
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
    return next(new BadRequest('Cannot create a purchase order without purchase items.'));
  }

  // default to a new uuid if the client did not provide one
  const puid = data.uuid || uuid();
  data.uuid = db.bid(puid);

  data = db.convert(data, ['supplier_uuid']);

  if (data.date) {
    data.date = new Date(data.date);
  }

  data.user_id = req.session.user.id;
  data.project_id = req.session.project.id;
  data.currency_id = req.session.enterprise.currency_id;

  if (req.session.stock_settings.enable_auto_purchase_order_confirmation) {
    data.status_id = PURCHASE_STATUS_CONFIRMED_ID;
  }

  const sql = 'INSERT INTO purchase SET ?';

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

      // Finally, for the inventories ordered, to know the average value of purchase interval,
      // the number of purchase and the date of the last order
      const getInventory = `
        SELECT BUID(purchase_item.inventory_uuid) AS inventory_uuid, inventory.purchase_interval,
          inventory.last_purchase, inventory.num_purchase
        FROM purchase_item
        JOIN inventory ON inventory.uuid = purchase_item.inventory_uuid
        WHERE purchase_item.purchase_uuid = ?
      `;

      return db.exec(getInventory, [data.uuid]);
    })
    .then((rows) => {
      const datePurchase = new Date(data.date);

      const transactionWrapper = db.transaction();
      rows.forEach((row) => {
        /**
          * Normally purchase interval is calculated by deducting the gap in months of
          * all purchase orders for a product, this form is also very expensive in terms of resources,
          * so let's store the date of the last orders and store the results in months in the column Purchase interval,
          * and in the following we would calculate each time the average value Multiply by number of old orders minus
          * one Add up by the period between the last purchase Order and the date of the current purchase order
          * and divide the results by the number of old orders
        */

        let purchaseInterval = row.purchase_interval;
        const numPurchase = row.num_purchase + 1;
        if (row.last_purchase) {
          const diff = moment(datePurchase).diff(moment(row.last_purchase));

          const duration = moment.duration(diff, 'milliseconds');
          const durationMonth = duration.asMonths();

          purchaseInterval = (((row.purchase_interval * (row.num_purchase - 1)) + durationMonth) / row.num_purchase);
        }

        // Just to prevent cases where the order interval is less than 0
        transactionWrapper.addQuery(
          'UPDATE inventory SET purchase_interval = ?, last_purchase = ?, num_purchase = ?  WHERE uuid = ?',
          [purchaseInterval, datePurchase, numPurchase, db.bid(row.inventory_uuid)],
        );

      });

      return transactionWrapper.execute();
    })
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
  const sql = 'UPDATE purchase SET ? WHERE uuid = ?;';

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

  // ensure expected options are parsed appropriately as binary
  db.convert(options, ['supplier_uuid', 'uuid', 'inventory_uuid']);
  const filters = new FilterParser(options, { tableAlias : 'p' });
  let statusIds = [];

  if (options.status_id) {
    statusIds = statusIds.concat(options.status_id);
  }

  // default purchase date
  filters.period('period', 'date');
  filters.dateFrom('custion_period_start', 'date');
  filters.dateTo('custom_period_end', 'date');
  filters.equals('user_id');
  filters.equals('uuid');

  filters.custom('inventory_uuid',
    'p.uuid IN (SELECT pi.purchase_uuid FROM purchase_item pi WHERE pi.inventory_uuid = ?)');

  filters.custom('status_id', 'p.status_id IN (?)', [statusIds]);
  filters.equals('supplier_uuid', 'uuid', 's');

  const sql = `
    SELECT BUID(p.uuid) AS uuid, dm.text as reference,
        p.cost, p.date, s.display_name  AS supplier, p.user_id, p.note,
        BUID(p.supplier_uuid) as supplier_uuid, u.display_name AS author,
        p.status_id, ps.text AS status
      FROM purchase AS p
      JOIN document_map dm ON p.uuid = dm.uuid
      JOIN supplier AS s ON s.uuid = p.supplier_uuid
      JOIN project AS pr ON p.project_id = pr.id
      JOIN user AS u ON u.id = p.user_id
      JOIN purchase_status AS ps ON ps.id = p.status_id
  `;

  filters.equals('reference', 'text', 'dm');
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
  const FROM_PURCHASE_ID = 1;
  const PURCHASE_PARTIALLY_RECEIVED = 4;
  const PURCHASE_FULLY_RECEIVED = 3;
  const PURCHASE_EXCESSIVELY_RECEIVED = 6;

  const glb = {};
  const purchaseUuid = db.bid(req.params.uuid);

  const sqlQuantities = `
    SELECT SUM(t.purchase_quantity) AS purchase_quantity, SUM(t.movement_quantity) AS movement_quantity
    FROM (
      (
        SELECT IFNULL(SUM(pi.quantity), 0) AS purchase_quantity, 0 AS movement_quantity FROM purchase p
        JOIN purchase_item pi ON pi.purchase_uuid = p.uuid
        WHERE p.uuid = ?
      ) UNION ALL (
        SELECT 0 AS purchase_quantity, SUM(m.quantity) AS movement_quantity FROM stock_movement m
        JOIN lot l ON l.uuid = m.lot_uuid
        JOIN purchase p ON p.uuid = l.origin_uuid
        WHERE p.uuid = ? AND m.flux_id = ? AND m.is_exit = 0
      )
    )t
  `;

  const sqlPurchaseDelay = `
    SELECT
    p.cost, DATEDIFF(m.date, p.date) AS delay
    FROM stock_movement m
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN purchase p ON p.uuid = l.origin_uuid
    WHERE p.uuid = ? AND m.flux_id = ? AND m.is_exit = 0 LIMIT 1;
  `;

  const sqlPurchaseInventories = `
    SELECT purchase_item.inventory_uuid AS inventory_uuid, inventory.delay, inventory.num_delivery
    FROM purchase_item
    JOIN inventory ON inventory.uuid = purchase_item.inventory_uuid
    WHERE purchase_item.purchase_uuid = ?
  `;

  const dbPromise = [
    db.one(sqlQuantities, [purchaseUuid, purchaseUuid, FROM_PURCHASE_ID]),
    db.one(sqlPurchaseDelay, [purchaseUuid, FROM_PURCHASE_ID]),
    db.exec(sqlPurchaseInventories, [purchaseUuid]),
  ];

  q.all(dbPromise)
    .spread((resultQuantities, resultDelay, resultPurchaseInventories) => {
      const rq = resultQuantities;
      const rd = resultDelay;

      glb.delay = util.roundDecimal((rd.delay / 30), 2);
      glb.purchaseInventories = resultPurchaseInventories;

      let query;
      let statusId;

      if (rq.movement_quantity > 0 && rq.movement_quantity === rq.purchase_quantity) {
        // the purchase is totally delivered
        statusId = PURCHASE_FULLY_RECEIVED;
        query = 'UPDATE purchase SET status_id = ? WHERE uuid = ?';
      } else if (rq.movement_quantity > 0 && rq.movement_quantity < rq.purchase_quantity) {
        // the purchase is partially delivered
        statusId = PURCHASE_PARTIALLY_RECEIVED;
        query = 'UPDATE purchase SET status_id = ? WHERE uuid = ?';
      } else if (rq.movement_quantity > rq.purchase_quantity) {
        // the purchase is delivered in an excessive quantity
        statusId = PURCHASE_EXCESSIVELY_RECEIVED;
        query = 'UPDATE purchase SET status_id = ? WHERE uuid = ?';
      }
      return query ? db.exec(query, [statusId, purchaseUuid]) : '';
    })
    .then(() => {
      const transaction = db.transaction();

      glb.purchaseInventories.forEach((row) => {
        /**
          * Normally the delay agreement time between the order and the delivery is calculated
          * by finding the average duration of agreement of orders of last six months for a product
          * this calculation is very expensive in terms of memory, which is the reason why we keep
          * this information in the inventory table for article shovel
        */
        const numDelivery = row.num_delivery + 1;

        const delay = (((row.delay * (numDelivery - 1)) + glb.delay) / numDelivery);

        transaction.addQuery(
          'UPDATE inventory SET delay = ?, num_delivery = ? WHERE uuid = ?',
          [delay, numDelivery, row.inventory_uuid],
        );
      });

      return transaction.execute();
    })
    .then(() => {
      res.status(200).send();
    })
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
      s.display_name AS supplier_name, u.display_name AS user_name, BUID(p.uuid) AS uuid,
      dm.text AS reference, p.date, BUID(pi.inventory_uuid) AS inventory_uuid,
      pi.quantity, pi.unit_price, IFNULL(distributed.quantity, 0) AS distributed_quantity,
      (pi.quantity - IFNULL(distributed.quantity, 0)) AS balance
    FROM purchase p
    JOIN document_map dm ON dm.uuid = p.uuid
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
    ) AS distributed
      ON distributed.inventory_uuid = pi.inventory_uuid
      AND distributed.origin_uuid = p.uuid
    WHERE p.uuid = ? HAVING balance > 0 AND balance <= pi.quantity
  `;

  db.exec(sql, [FROM_PURCHASE_ID, purchaseUuid, purchaseUuid])
    .then(rows => res.status(200).json(rows))
    .catch(next)
    .done();
}

/**
 * @function purchaseState
 *
 * @description
 * This function allows to select the list of the different Status of a purchase order
 */
function purchaseState(req, res, next) {
  const sql = `
    SELECT purchase_status.id, purchase_status.text
    FROM purchase_status
  `;

  db.exec(sql)
    .then(rows => res.status(200).json(rows))
    .catch(next)
    .done();
}
