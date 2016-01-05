var q = require('q');
var db = require('./../../lib/db');
var uuid = require('./../../lib/guid');
var journal = require('./journal');

// GET /purchaseorders

/*
 * HTTP Controllers
*/
exports.execute = function (req, res, next) {
  executePurchase(req.session.user.id, req.body)
  .then(function (id) {
    res.status(200).send({ purchaseId : id });
  })
  .catch(next)
  .done();
};

exports.getPurchaseOrders = function (req, res, next) {
  'use strict';

  var sql,
      status = req.query.status;

  // base query
  sql = 'SELECT COUNT(uuid) AS count FROM purchase WHERE is_donation = 0 ' +
        'AND (is_return = 0 OR is_return IS NULL) ';

  switch (status) {

    // the purchase order is pending payment
    case 'pending':
      sql += ' AND paid = 0 AND confirmed = 0;';
      break;

    // the purchase order has been paid, but items have not been
    // shipped
    case 'paid':
      sql += ' AND paid = 1;';
      break;

    // the purchased items have been shipped, but have not
    // arrived in the warehouse yet
    case 'shipped':
      sql += ' AND closed = 0 AND confirmed = 1;';
      break;

    // the purchase order has been fulfilled with stock in the
    // warehouse.
    case 'delivered':
      sql += ' AND closed = 1 AND confirmed = 1;';
      break;

    default:
      sql += ';';
      break;
  }

  db.exec(sql)
  .then(function (rows) {
    res.status(200).send(rows);
  })
  .catch(next)
  .done();
};

/*
 * Utility Methods
*/
// TODO Server side sale and purchase order are very similar, they should
// probably be combined

// TODO employee responsible for purchase, credited money from purchase request
//      must be able to select them at purchase order

// TODO create purchase order, expense cash, confirm recieving (work with overflow money)

// TODO
//  - Purchase price and sale price
//  - On purchase order no money is moved
//  - Move money from cash balance account to asset account (on authorisation of purchase)
//  - On sale move money from asset account to expense account,
//    credit sale account

function values(obj) {
  // get an array of an object's values
  // cannot wait for es6's Object.values(o);
  return Object.keys(obj).map(function (k) { return obj[k]; });
}

function executePurchase(userId, data) {
  // Writes data to the primary_cash table
  // then the primary_cash_items table and
  // finally the posting_journal
  var primaryCashId = uuid();

  return writeCash(primaryCashId, userId, data.details)
    .then(function () {
      return writeCashItems(primaryCashId, data.transaction);
    })
    .then(function () {
      return postToJournal(primaryCashId, userId);
    })
    .then(function () {
      return q(primaryCashId);
    });
}

function writeCash(primaryCashId, userId, data) {
  // write items to the primary_cash table
  var sql, params;

  sql =
    'INSERT INTO primary_cash ' +
      '(project_id, type, date, deb_cred_uuid, deb_cred_type, currency_id, ' +
      'cash_box_id, account_id, cost, description, origin_id, uuid, user_id) ' +
    'VALUES ' +
      '(?,?,?,?,?,?,?,?,?,?,?,?,?);';

  params = values(data);
  params.push(primaryCashId);
  params.push(userId);

  return db.exec(sql, params);
}

function writeCashItems(primaryCashId, data) {
  var sql, queries, params;

  sql =
    'INSERT INTO `primary_cash_item` ' +
      '(inv_po_id, debit, credit, document_uuid, uuid, primary_cash_uuid) ' +
    'VALUES ' +
      '(?, ?, ?, ?, ?, ?)';

  queries = data.map(function (item) {
    params = values(item);
    params.push(uuid());
    params.push(primaryCashId);
    return db.exec(sql, params);
  });

  return q.all(queries);
}

function postToJournal(primaryCashId, userId) {
  var dfd = q.defer();
  journal.request('indirect_purchase', primaryCashId, userId, function (err, result) {
    if (err) { return dfd.reject(err); }
    dfd.resolve(result);
  });
  return dfd.promise;
}
