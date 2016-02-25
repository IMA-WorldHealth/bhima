/**
* The /vouchers/ HTTP API endpoint
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
* POST /vouchers
*
* @method create
*/
function create(req, res, next) {

  if (req.body.voucher.date) { req.body.voucher.date = new Date(req.body.voucher.date); }

  /** Initialise the transaction handler */
  var transaction = db.transaction();

  transaction.addQuery('INSERT INTO voucher SET ?', [req.body.voucher]);

  var queryVoucherItem = _.isArray(req.body.voucher_item) ?
    'INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid) VALUES ?' :
    'INSERT INTO voucher_item SET ?';

  transaction.addQuery(queryVoucherItem, [req.body.voucher_item]);

  transaction.execute()
  .then(function (rows) {
    res.status(201).json({ id: req.body.voucher.uuid });
  })
  .catch(next)
  .done();
}
