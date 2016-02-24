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
* @required lib/db
*/

'use strict';

var _    = require('lodash'),
    uuid = require('node-uuid'),
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

  var builder = queryCondition(query, req.query);

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

  // if (!checkForMissing(req.body)) { return next(new req.codes.ERR_MISSING_REQUIRED_PARAMETERS()); }
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

/**
* @function checkForMissing
* @param {object} The sended object
* @return {boolean}
* @description This functin check missing data for voucher and voucher item
*/
function checkForMissing(_data) {
  var voucher = _data.voucher;
  var voucher_item = _data.voucher_item;

  var validVoucher =
    voucher.uuid && voucher.date && voucher.project_id && voucher.reference &&
    voucher.currency_id && (voucher.amount + 1) && voucher.description &&
    voucher.document_uuid && voucher.user_id ;

  var validVoucherItem =
    voucher_item.uuid && voucher_item.account_id &&
    (voucher_item.debit + 1) && (voucher_item.credit + 1) && voucher_item.voucher_uuid;

  /** handle array of items */
  if (_.isArray(voucher_item)) {
    var predicat = false;
    validVoucherItem = true;
    _.forEach(voucher_item, function (elem) {
      predicat = _.every(elem, function (item) {
          return _.isNil(item) === false || item === 0;
      });
      validVoucherItem = validVoucherItem && predicat;
    });
  }

  return (validVoucher && validVoucherItem);
}

/**
* @function queryCondition
* @param {string} _query The sql query
* @param {object} _requestQuery The req.query object
* @return {array} The final query and conditions
* @description build query string conditions
*/
function queryCondition(_query, _requestQuery) {
  var criteria, conditions = [];

  criteria = Object.keys(_requestQuery).map(function (item) {
    conditions = conditions.concat(item, _requestQuery[item]);
    return '?? = ?';
  }).join(' AND ');

  _query += (Object.keys(_requestQuery).length > 0) ? 'WHERE ' + criteria : '';
  return { query : _query, conditions : conditions };
}
