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
const { uuid } = require('../../lib/util');
const db = require('../../lib/db');
const barcode = require('../../lib/barcode');
const BadRequest = require('../../lib/errors/BadRequest');

const identifiers = require('../../config/identifiers');
const FilterParser = require('../../lib/filter');
const util = require('../../lib/util');

// See the schema for purchase_status and the value of
// PURCHASES.STATUS.CONFIRMED
// PURCHASES.STATUS.RECEIVED
// PURCHASES.STATUS.PARTIALLY_RECEIVED
// PURCHASES.STATUS.EXCESSIVE_RECEIVED_QUANTITY
// in the bhima.sql data

const PURCHASE_STATUS_CONFIRMED_ID = 2;
const PURCHASES_STATUS_RECEIVED_ID = 3;
const PURCHASES_STATUS_PARTIALLY_RECEIVED_ID = 4;
const PURCHASES_STATUS_EXCESSIVE_RECEIVED_QUANTITY_ID = 6;

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
  let inventories = [];

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

  const statusPurchase = data.status_id;

  if (data.status_id === PURCHASE_STATUS_CONFIRMED_ID) {
    inventories = data.items.map(item => item.inventory_uuid);
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
      let transactions;

      if (statusPurchase !== PURCHASE_STATUS_CONFIRMED_ID) {
        return true;
      }

      if (inventories.length) {
        transactions = purchaceIntervalleSetting(inventories);
      }

      return transactions.execute();
    })
    .then((rows) => {
      if (statusPurchase !== PURCHASE_STATUS_CONFIRMED_ID) {
        return true;
      }

      const datePurchase = new Date(data.date);
      const transactionWrapper = db.transaction();

      rows.forEach((row) => {
        /*
          * For the calculation of the average order interval, the system takes into account
          * that of confirmed purchase orders, received in stock or partially and even those
          * that are received in excess quantity, the default order interval is zero, and the
          * calculation is made in addition the sum of all the order intervals by the sum of
          * the purchase orders minus one, the results are stored in the inventory table,
          * in order to facilitate the calculation of the various indicators for stock management
        */
        const purchaseInterval = row[0].purchase_interval || 0;
        const numPurchase = row[0].num_purchase;

        // Just to prevent cases where the order interval is less than 0
        transactionWrapper.addQuery(
          'UPDATE inventory SET purchase_interval = ?, last_purchase = ?, num_purchase = ?  WHERE uuid = ?',
          [purchaseInterval, datePurchase, numPurchase, db.bid(row[0].inventory_uuid)],
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
  req.body.date = new Date(req.body.date);
  const sql = 'UPDATE purchase SET ? WHERE uuid = ?;';

  const data = db.convert(req.body, ['supplier_uuid']);

  // protect from updating the purchase's uuid
  delete data.uuid;

  db.exec(sql, [req.body, db.bid(req.params.uuid)])
    .then(() => resetPurchaseIntervall(req.params.uuid))
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

function purchaceIntervalleSetting(items) {
  const trans = db.transaction();

  items.forEach((item) => {
    const sql = `
      SELECT ROUND(AVG(orderIntervall.diff),2) AS purchase_interval, (COUNT(orderIntervall.text)) AS num_purchase,
      BUID(?) AS inventory_uuid
      FROM (
        SELECT aggr.text, aggr.date, aggr.precedent_date,
          (TIMESTAMPDIFF(DAY, DATE(aggr.precedent_date), DATE(aggr.date)) *12/365.24) AS diff,
        aggr.inventory_uuid
        FROM (
          SELECT purch.text, DATE(purch.date) AS date,
            @last_purchase AS precedent_date, (@last_purchase := DATE(purch.date)) AS last_purchase,
            BUID(purch.inventory_uuid) AS inventory_uuid
          FROM (
            SELECT inv.text, p.date, inv.uuid AS inventory_uuid
            FROM purchase AS p
            JOIN purchase_item AS it ON it.purchase_uuid = p.uuid
            JOIN inventory AS inv ON inv.uuid = it.inventory_uuid
            WHERE inv.uuid = ? AND p.status_id IN ( ?, ?, ?, ?)
            ORDER BY p.date ASC
          ) AS purch, (SELECT @last_purchase := DATE(0)) AS z
        ) AS aggr
      ) AS orderIntervall
    `;

    trans.addQuery(sql, [
      db.bid(item),
      db.bid(item),
      PURCHASE_STATUS_CONFIRMED_ID,
      PURCHASES_STATUS_RECEIVED_ID,
      PURCHASES_STATUS_PARTIALLY_RECEIVED_ID,
      PURCHASES_STATUS_EXCESSIVE_RECEIVED_QUANTITY_ID,
    ]);
  });

  return trans;
}

function resetPurchaseIntervall(purchaseUuid) {
  const sql = `
    SELECT BUID(it.inventory_uuid) AS inventory_uuid
    FROM purchase_item AS it
    WHERE it.purchase_uuid = ?
  `;

  return db.exec(sql, [db.bid(purchaseUuid)])
    .then((rows) => {
      const inventories = rows.map(item => item.inventory_uuid);

      const transactions = purchaceIntervalleSetting(inventories);

      return transactions.execute();
    })
    .then((items) => {
      const transactionWrapper = db.transaction();
      const updateDate = new Date();

      items.forEach((item) => {
        /*
          * here we trace all the times when the status of a purchase
          * order is modified, this one allows to recalculate the order
          * interval as well as the number of valid orders
        */
        const purchaseInterval = item[0].purchase_interval || 0;
        const numPurchase = item[0].num_purchase;

        transactionWrapper.addQuery(
          'UPDATE inventory SET purchase_interval = ?, last_purchase = ?, num_purchase = ?  WHERE uuid = ?',
          [purchaseInterval, updateDate, numPurchase, db.bid(item[0].inventory_uuid)],
        );
      });

      return transactionWrapper.execute();
    });
}
