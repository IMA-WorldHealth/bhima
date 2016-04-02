/**
* The /vouchers HTTP API endpoint
*
* @module finance/vouchers
*
* @desc This module is responsible for handling all crud operations relatives
* to voiuchers transactions and define all vouchers api functions
*
* @required lodash
* @required node-uuid
* @required lib/util
* @required lib/db
*/

'use strict';

var _    = require('lodash'),
    uuid = require('node-uuid'),
    util = require('../../lib/util'),
    db   = require('../../lib/db');

/** Get list of vouchers */
exports.list = list;

/** Get detail of vouchers */
exports.detail = detail;

/** Create a new voucher record */
exports.create = create;

/**
* GET /vouchers
*
* @method list
*/
function list(req, res, next) {
  var query =
    'SELECT v.uuid, v.date, v.project_id, v.reference, v.currency_id, v.amount, ' +
    'v.description, v.document_uuid, v.user_id, vi.uuid AS voucher_item_uuid, ' +
    'vi.account_id, vi.debit, vi.credit ' +
    'FROM voucher v JOIN voucher_item vi ON vi.voucher_uuid = v.uuid ';

  var builder = util.queryCondition(query, req.query);

  db.exec(builder.query, builder.conditions)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
* GET /vouchers/:uuid
*
* @method detail
*/
function detail(req, res, next) {
  var query =
    'SELECT v.uuid, v.date, v.project_id, v.reference, v.currency_id, v.amount, ' +
    'v.description, v.document_uuid, v.user_id, vi.uuid AS voucher_item_uuid, ' +
    'vi.account_id, vi.debit, vi.credit ' +
    'FROM voucher v JOIN voucher_item vi ON vi.voucher_uuid = v.uuid ' +
    'WHERE v.uuid = ? ;';

  db.exec(query, req.params.uuid)
  .then(function (rows) {
    if (!rows.length) { return next(new req.codes.ERR_NOT_FOUND()); }
    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
}

/**
 * Creates a filter that takes only takes the columns passed in from the
 * object, in the order that they are passed in.
 *
 * @method take
 * @returns {function} filter - a filtering function to that will convert an
 * object to an array with the given keys.
 *
 * @private
 */
function take() {

  // get the arguments as an array
  var keys = Array.prototype.slice.call(arguments);

  // return the filter function
  return function (object) {
    return keys.map(function (key) {
      return object[key];
    });
  };
}


/**
* POST /vouchers
*
* @method create
*/
function create(req, res, next) {

  // alias both the voucher and the voucher items
  var voucher = req.body.voucher;
  var items = req.body.voucher.items || [];

  // remove the voucher items from the request before insertion into the
  // database
  delete voucher.items;

  // convert dates to a date objects
  if (voucher.date) {
    voucher.date = new Date(voucher.date);
  }

  // make sure the voucher has an id and convert an array of arrays
  voucher.uuid = voucher.uuid || uuid.v4();

  // preprocess the items so they uuids if required
  items.forEach(function (item) {

    // if the item doesn't have a uuid, create one for it.
    item.uuid = item.uuid || uuid.v4();

    // make sure the items reference the voucher correctly
    item.voucher_uuid = item.voucher_uuid || voucher.uuid;
  });

  // map items into an array of arrays
  items = _.map(items, take('uuid', 'account_id', 'debit', 'credit', 'voucher_uuid'));

  // initialise the transaction handler
  var transaction = db.transaction();

  // build the SQL query
  transaction
    .addQuery('INSERT INTO voucher SET ?', [ voucher ])
    .addQuery('INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid) VALUES ?', [ items ]);

  // execute the transaction
  transaction.execute()
  .then(function (rows) {
    res.status(201).json({
      uuid: voucher.uuid
    });
  })
  .catch(next)
  .done();
}
