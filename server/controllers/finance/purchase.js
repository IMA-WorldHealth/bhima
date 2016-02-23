var q = require('q');
var db = require('./../../lib/db');
var uuid = require('./../../lib/guid');
var journal = require('./journal');



/** 
 * Utility method to ensure purchase items lines reference purchase.
 * @param {Object} purchaseItems - An Array of all purchase items to be written 
 * @param {string} purchaseUuid - UUID of referenced purchase order
 * @returns {Object} An Array of all purchases items with guaranteed UUIDs and Purchase orders references
 */
function linkPurchaseItems(purchaseItems, purchaseUuid) { 
  return purchaseItems.map(function (purchaseItem) { 
     
    purchaseItem.uuid = purchaseItem.uuid || uuid();
    purchaseItem.purchase_uuid = purchaseUuid;
   
    // Collapse sale item into Array to be inserted into database
    return Object.keys(purchaseItem).map(function (key) { 
      return purchaseItem[key];
    });
  });
}

// looks up a single purchase record and associated purchase_items
function lookupPurchaseOrder(uuid, codes) {
  'use strict';

  var record;

  var sqlPurchase =
    'SELECT purchase.uuid, purchase.reference, purchase.cost, purchase.discount, purchase.purchase_date, purchase.paid, ' +
    'creditor.text, employee.name, employee.prenom, user.first, user.last, ' +
    'purchase.creditor_uuid, purchase.timestamp, purchase.note, purchase.paid_uuid, purchase.confirmed, purchase.closed, ' +
    'purchase.is_direct, purchase.is_donation, purchase.emitter_id, purchase.is_authorized, purchase.is_validate, ' +
    'purchase.confirmed_by, purchase.is_integration, purchase.purchaser_id, purchase.receiver_id ' +
    'FROM purchase ' +
    'JOIN creditor ON creditor.uuid = purchase.creditor_uuid ' +
    'JOIN employee ON employee.id = purchase.purchaser_id ' +
    'JOIN user ON user.id = purchase.emitter_id ' +
    'WHERE purchase.uuid = ? ;';

  var sqlPurchaseItem =
    'SELECT purchase_item.purchase_uuid, purchase_item.uuid, purchase_item.quantity, purchase_item.unit_price, ' +
    'purchase_item.total, inventory.text ' +
    'FROM purchase_item ' +
    'JOIN inventory ON inventory.uuid = purchase_item.inventory_uuid ' +
    'WHERE purchase_item.purchase_uuid = ? ';  

  return db.exec(sqlPurchase, [uuid])
  .then(function (rows) {

    if (rows.length === 0) {
      throw new codes.ERR_NOT_FOUND();
    }

    // store the record for return
    record = rows[0];

    return db.exec(sqlPurchaseItem, [uuid]);
  })
  .then(function (rows) {

    // bind the purchase items to the "items" property and return
    record.items = rows;

    return record;
  });
}


/**
* Create a Purchase Order in the database
*
**/

function create (req, res, next) {
  'use strict';

  var purchase = req.body;
  var transaction;  
  var purchaseOrder = purchase.purchase_order;
  var purchaseItem =  purchase.purchase_item;

  // Reject invalid parameters
  if (!purchaseOrder || !purchaseItem) { 
    res.status(400).json({
      code : 'ERROR.ERR_MISSING_INFO', 
      reason : 'A valid purchase details and purchase items must be provided under the attributes `purchaseOrder` and `purchaseItem`'
    });
    return;
  }
  
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
      res.status(201).json({ uuid : purchaseOrder.uuid });
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
    'SELECT purchase.uuid, purchase.reference, purchase.cost, purchase.discount, purchase.purchase_date, purchase.paid, ' +
    'creditor.text, employee.name, employee.prenom, user.first, user.last ' +
    'FROM purchase ' +
    'JOIN creditor ON creditor.uuid = purchase.creditor_uuid ' +
    'JOIN employee ON employee.id = purchase.purchaser_id ' +
    'JOIN user ON user.id = purchase.emitter_id; ';

  if (req.query.complete === '1') {
    sql =  
      'SELECT purchase.uuid, purchase.reference, purchase.cost, purchase.discount, purchase.purchase_date, purchase.paid, ' +
      'creditor.text, employee.name, employee.prenom, user.first, user.last, ' +
      'purchase.creditor_uuid, purchase.timestamp, purchase.note, purchase.paid_uuid, purchase.confirmed, purchase.closed, ' +
      'purchase.is_direct, purchase.is_donation, purchase.emitter_id, purchase.is_authorized, purchase.is_validate, ' +
      'purchase.confirmed_by, purchase.is_integration, purchase.purchaser_id, purchase.receiver_id ' +
      'FROM purchase ' +
      'JOIN creditor ON creditor.uuid = purchase.creditor_uuid ' +
      'JOIN employee ON employee.id = purchase.purchaser_id ' +
      'JOIN user ON user.id = purchase.emitter_id; ';
  }

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

function detail (req, res, next) {
  'use strict';

  var uuid = req.params.uuid;

  lookupPurchaseOrder(uuid, req.codes)
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}


// PUT /purchase/:uuid
function update(req, res, next) {
  'use strict';

  var sql;
  var uuid = req.params.uuid;

  sql =
    'UPDATE purchase SET ? WHERE uuid = ?;';

  db.exec(sql, [req.body, uuid])
  .then(function () {

    // fetch the changed object from the database
    return lookupPurchaseOrder(uuid);
  })
  .then(function (record) {

    // all updates completed successfull, return full object to client
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