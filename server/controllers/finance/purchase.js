var q = require('q');
var db = require('./../../lib/db');
const uuid = require('node-uuid');

/**
 * Utility method to ensure purchase items lines reference purchase.
 * @param {Object} purchaseItems - An Array of all purchase items to be written
 * @param {string} purchaseUuid - UUID of referenced purchase order
 * @returns {Object} An Array of all purchases items with guaranteed UUIDs and Purchase orders references
 */
function linkPurchaseItems(purchaseItems, purchaseUuid) {
  return purchaseItems.map(function (purchaseItem) {

    purchaseItem.uuid = db.bid(purchaseItem.uuid || uuid());
    purchaseItem.purchase_uuid = purchaseUuid;

    purchaseItem.inventory_uuid = db.bid(purchaseItem.inventory_uuid);

    // Collapse sale item into array to be inserted into database
    return Object.keys(purchaseItem).map(function (key) {
      return purchaseItem[key];
    });
  });
}

// looks up a single purchase record and associated purchase_items
function lookupPurchaseOrder(uid, codes) {
  'use strict';

  var record;

  var sqlPurchase =
    `SELECT BUID(purchase.uuid) as uuid, purchase.reference, purchase.cost, purchase.discount,
      purchase.purchase_date, purchase.paid, creditor.text, employee.name, employee.prenom,user.first, user.last,
      BUID(purchase.creditor_uuid) as creditor_uuid, purchase.timestamp, purchase.note,
      BUID(purchase.paid_uuid) as paid_uuid, purchase.confirmed, purchase.closed,
      purchase.is_direct, purchase.is_donation, purchase.emitter_id, purchase.is_authorized, purchase.is_validate,
      purchase.confirmed_by, purchase.is_integration, purchase.purchaser_id, purchase.receiver_id
    FROM purchase
    JOIN creditor ON creditor.uuid = purchase.creditor_uuid
    JOIN employee ON employee.id = purchase.purchaser_id
    JOIN user ON user.id = purchase.emitter_id
    WHERE purchase.uuid = ?;`;

  var sqlPurchaseItem =
    `SELECT BUID(purchase_item.purchase_uuid) as purchase_uuid, BUID(purchase_item.uuid) as uuid,
      purchase_item.quantity, purchase_item.unit_price, purchase_item.total, inventory.text
    FROM purchase_item
    JOIN inventory ON inventory.uuid = purchase_item.inventory_uuid
    WHERE purchase_item.purchase_uuid = ?`;

  return db.exec(sqlPurchase, [uid])
  .then(function (rows) {

    if (rows.length === 0) {
      throw new codes.ERR_NOT_FOUND();
    }

    // store the record for return
    record = rows[0];

    return db.exec(sqlPurchaseItem, [uid]);
  })
  .then(function (rows) {

    // bind the purchase items to the "items" property and return
    record.items = rows;

    return record;
  });
}

// convert uuids and dates for insertion into database
function convert(data) {

  if (data.purchase_date) {
    data.purchase_date = new Date(data.purchase_date);
  }

  if (data.creditor_uuid) {
    data.creditor_uuid = db.bid(data.creditor_uuid);
  }

  if (data.paid_uuid) {
    data.paid_uuid = db.bid(data.paid_uuid);
  }

  return data;
}


/**
 * Create a Purchase Order in the database
 */
function create (req, res, next) {
  'use strict';

  var purchase = req.body;
  var transaction;
  var purchaseOrder = purchase.purchase_order;
  var purchaseItem =  purchase.purchase_item;

  // reject invalid parameters
  if (!purchaseOrder || !purchaseItem) {
    res.status(400).json({
      code : 'ERROR.ERR_MISSING_INFO',
      reason : 'A valid purchase details and purchase items must be provided under the attributes `purchaseOrder` and `purchaseItem`'
    });
    return;
  }

  // default to a new uuid if the client did not provide one
  purchaseOrder.uuid = db.bid(purchaseOrder.uuid || uuid.v4());

  purchaseOrder = convert(purchaseOrder);

  var sqlPurchase = 'INSERT INTO purchase SET ?';

  var sqlPurchaseItem = 'INSERT INTO purchase_item (uuid, inventory_uuid, quantity, unit_price, ' +
    'total, purchase_uuid) VALUES ?';

  var dataPurchaseItem = linkPurchaseItems(purchase.purchase_item, purchaseOrder.uuid);


  transaction = db.transaction();

  transaction
    .addQuery(sqlPurchase, [purchaseOrder])
    .addQuery(sqlPurchaseItem,[dataPurchaseItem]);

  transaction.execute()
    .then(function (results) {
      res.status(201).json({ uuid : uuid.unparse(purchaseOrder.uuid) });
    })
    .catch(next)
    .done();
}


/**
* GET /projects/
*
* Returns the details of a single project
*/
function list (req, res, next) {
  'use strict';
  var sql;

  sql =
    `SELECT BUID(purchase.uuid) as uuid, purchase.reference, purchase.cost, purchase.discount,
      purchase.purchase_date, purchase.paid, creditor.text, employee.name, employee.prenom,
      user.first, user.last
    FROM purchase
    JOIN creditor ON creditor.uuid = purchase.creditor_uuid
    JOIN employee ON employee.id = purchase.purchaser_id
    JOIN user ON user.id = purchase.emitter_id;`;

  /** @todo - this should be 'detailed' */
  if (req.query.complete === '1') {
    sql =
      `SELECT BUID(purchase.uuid) as uuid, purchase.reference, purchase.cost, purchase.discount,
        purchase.purchase_date, purchase.paid, creditor.text, employee.name, employee.prenom,
        user.first, user.last, BUID(purchase.creditor_uuid) as creditor_uuid, purchase.timestamp,
        purchase.note, purchase.paid_uuid, purchase.confirmed, purchase.closed,
        purchase.is_direct, purchase.is_donation, purchase.emitter_id, purchase.is_authorized, purchase.is_validate,
        purchase.confirmed_by, purchase.is_integration, purchase.purchaser_id, purchase.receiver_id
      FROM purchase
      JOIN creditor ON creditor.uuid = purchase.creditor_uuid
      JOIN employee ON employee.id = purchase.purchaser_id
      JOIN user ON user.id = purchase.emitter_id;`;
  }

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

function detail(req, res, next) {
  'use strict';

  var uid = db.bid(req.params.uuid);

  lookupPurchaseOrder(uid, req.codes)
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}


// PUT /purchase/:uuid
function update(req, res, next) {
  'use strict';

  var uid = db.bid(req.params.uuid);

  var sql =
    'UPDATE purchase SET ? WHERE uuid = ?;';

  db.exec(sql, [req.body, uid])
  .then(function () {

    // fetch the changed object from the database
    return lookupPurchaseOrder(uid, req.codes);
  })
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}



// create a new purchase order
exports.create = create;

//Read all purchase order
exports.list = list;

// Read a specific purchase order
exports.detail = detail;

//Update properties of a purchase Order
exports.update = update;
