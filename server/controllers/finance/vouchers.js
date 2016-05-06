/**
* The /vouchers HTTP API endpoint
*
* @module finance/vouchers
*
* @description This module is responsible for handling CRUD operations
* against the `voucher` table.
*
* @requires lodash
* @requires node-uuid
* @requires lib/util
* @requires lib/db
* @requires lib/errors/NotFound
*/

const _    = require('lodash');
const uuid = require('node-uuid');
const util = require('../../lib/util');
const db   = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');
const BadRequest = require('../../lib/errors/BadRequest');
const journal = require('./journal/voucher');

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
    `SELECT BUID(v.uuid) as uuid, v.date, v.project_id, v.currency_id, v.amount,
      v.description, BUID(vi.document_uuid) as document_uuid,
      v.user_id, BUID(vi.uuid) AS voucher_item_uuid,
      vi.account_id, vi.debit, vi.credit,
      CONCAT(p.abbr, v.reference) AS reference 
    FROM voucher v
    JOIN voucher_item vi ON vi.voucher_uuid = v.uuid
    JOIN project p ON p.id = v.project_id `;

  // convert binary params if they exist
  if (req.query.document_uuid) {
    req.query.document_uuid = db.bid(req.query.document_uuid);
  }

  // format query parameters appropriately
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
    `SELECT BUID(v.uuid) as uuid, v.date, v.project_id, v.reference, v.currency_id, v.amount,
      v.description, BUID(vi.document_uuid), v.user_id, BUID(vi.uuid) AS voucher_item_uuid,
      vi.account_id, vi.debit, vi.credit
    FROM voucher v JOIN voucher_item vi ON vi.voucher_uuid = v.uuid
    WHERE v.uuid = ?;`;

  var id = db.bid(req.params.uuid);

  db.exec(query, id)
  .then(function (rows) {
    if (!rows.length) {
      throw new NotFound(`Could not find a voucher with id ${req.params.id}`);
    }
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

  // alias both the voucher and the voucher items
  var voucher = req.body.voucher;
  var items = req.body.voucher.items || [];

  // a voucher without two items doesn't make any sense in double-entry
  // accounting.  Therefore, throw a bad data error if there are any fewer
  // than two items in the journal voucher.
  if (items.length < 2) {
    return next(
      new BadRequest(
        `Expected there to be at least two items, but only received
        ${items.length} items.`
      )
    );
  }

  // remove the voucher items from the request before insertion into the
  // database
  delete voucher.items;

  // convert dates to a date objects
  if (voucher.date) {
    voucher.date = new Date(voucher.date);
  }


  // make sure the voucher has an id
  var vuid = voucher.uuid || uuid.v4();
  voucher.uuid = db.bid(vuid);

  // preprocess the items so they have uuids as required
  items.forEach(function (item) {

    // if the item doesn't have a uuid, create one for it.
    item.uuid = db.bid(item.uuid || uuid.v4());

    // make sure the items reference the voucher correctly
    item.voucher_uuid = db.bid(item.voucher_uuid || vuid);

    // convert the document uuid if it exists
    if (item.document_uuid) {
      item.document_uuid = db.bid(item.document_uuid);
    }

    // convert the entity uuid if it exists
    if (item.entity_uuid) {
      item.entity_uuid = db.bid(item.entity_uuid);
    }
  });

  // map items into an array of arrays
  items = _.map(items, util.take('uuid', 'account_id', 'debit', 'credit', 'voucher_uuid'));

  // initialise the transaction handler
  var transaction = db.transaction();

  // build the SQL query
  transaction
    .addQuery('INSERT INTO voucher SET ?', [ voucher ])
    .addQuery('INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid) VALUES ?', [ items ]);

  // execute the transaction
  journal(transaction, voucher.uuid)
  .then(function (rows) {
    res.status(201).json({
      uuid: vuid
    });
  })
  .catch(next)
  .done();
}
