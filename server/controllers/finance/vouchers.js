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
* @requires lib/ReportManager
* @requires lib/errors/NotFound
* @requires lib/errors/BadRequest
* @requires ./journal/voucher
*/

'use strict';

const _    = require('lodash');
const uuid = require('node-uuid');
const util = require('../../lib/util');
const db   = require('../../lib/db');
const rm   = require('../../lib/ReportManager');
const NotFound = require('../../lib/errors/NotFound');
const BadRequest = require('../../lib/errors/BadRequest');
const journal = require('./journal/voucher');

/** Module constants */
const receiptUrl = './server/controllers/finance/reports/voucher.receipt.handlebars';
const reportUrl = './server/controllers/finance/reports/voucher.report.handlebars';

/** Get list of vouchers */
exports.list = list;

/** Get detail of vouchers */
exports.detail = detail;

/** Create a new voucher record */
exports.create = create;

/** Get the voucher report */
exports.report = report;

/** Get the voucher receipt */
exports.receipt = receipt;

/**
* GET /vouchers
*
* @method list
*/
function list(req, res, next) {
  'use strict';

  let dateConditon = null;
  let detailed = !util.nullString(req.query.detailed) ? 1 : 0;
  let query = getSql(detailed);

  // convert binary params if they exist
  if (req.query.document_uuid) {
    req.query.document_uuid = db.bid(req.query.document_uuid);
  }

  // the date conditions string
  if (req.query.dateFrom && req.query.dateTo) {
    dateConditon = 'DATE(v.date) BETWEEN DATE(?) AND DATE(?)';
  }

  // remove detailed for queryCondition
  delete req.query.detailed;

  // build query and parameters correctly
  let builder = util.queryCondition(query, req.query, null, dateConditon);

  // grouping for avoid doublons of detailed request
  builder.query += !detailed ? ' GROUP BY v.uuid ' : '';

  db.exec(builder.query, builder.conditions)
  .then(rows => res.status(200).json(rows))
  .catch(next)
  .done();
}

/**
* GET /vouchers/:uuid
*
* @method detail
*/
function detail(req, res, next) {
  'use strict';

  getVouchers(req.params.uuid)
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
  } else {
    voucher.date = new Date();
  }

  // attach session information
  voucher.user_id = req.session.user.id;
  voucher.project_id = req.session.project.id;

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

/**
* GET /vouchers/receipt/:uuid
*
* @method receipt
*/
function receipt(req, res, next) {
  'use strict';

  // page options
  let reportOptions = { pageSize : 'A5', orientation: 'landscape' };

  // request for detailed receipt
  req.query.detailed = true;

  getVouchers(req.params.uuid, req.query)
  .then(rows => {
    const data = { rows: rows };
    return rm.build(req, data, receiptUrl, reportOptions);
  })
  .spread((document, headers) => {
    res.set(headers).send(document);
  })
  .catch(next)
  .done();
}

/**
* GET /vouchers/reports
*
* @method report
*/
function report(req, res, next) {
  'use strict';

  // page options
  let reportOptions = { pageSize : 'A4', orientation: 'landscape' };

  getVouchers(null, req.query)
  .then(rows => {
    const data = { rows: rows, dateFrom: req.query.dateFrom, dateTo: req.query.dateTo };
    return rm.build(req, data, reportUrl, reportOptions);
  })
  .spread((document, headers) => {
    res.set(headers).send(document);
  })
  .catch(next)
  .done();
}

/**
 * @function getVouchers
 * @param {null|string} uuid The voucher uuid, returns list of voucher according the uuid
 * @param {null|object} query The req.query object, retunrs list of voucher according the query,
 * @return promise
 */
function getVouchers(uuid, request) {
  'use strict';

  let detailed = request && !util.nullString(request.detailed) ? 1: 0;

  // sql detailed or not for voucher
  let sql = getSql(detailed);

  // binary uuid
  let bid = uuid ? db.bid(uuid) : null;

  // sql params
  let sqlParams = [];

  if (request && (!util.nullString(request.dateFrom) && !util.nullString(request.dateTo)) && uuid) {

    /**
     * request is given but with dates, and uuid is also given :
     * (request && (Boolean(request.dateFrom) && Boolean(request.dateTo)) && uuid)
     */
    sql += 'WHERE v.uuid = ? AND DATE(v.date) >= DATE(?) AND DATE(v.date) <= DATE(?)';
    sqlParams = [];
    sqlParams.push(bid);
    sqlParams.push(request.dateFrom);
    sqlParams.push(request.dateTo);

  } else if ((request && (util.nullString(request.dateFrom) || util.nullString(request.dateTo)) && uuid) || (!request && uuid)) {

    /**
     * request is given but without dates, and uuid is also given :
     * (request && (!Boolean(request.dateFrom) || !Boolean(request.dateTo)) && uuid)
     *
     * request is not given, and uuid is given :
     * (!request && uuid)
     */
    sql += 'WHERE v.uuid = ?';
    sqlParams = [];
    sqlParams.push(bid);

  } else if (request && (!util.nullString(request.dateFrom) && !util.nullString(request.dateTo)) && !uuid) {

    /**
     * request is given with dates, and uuid is not given :
     * (request && (request.dateFrom !== 'null' && request.dateTo !== 'null') && !uuid)
     */
    sql += 'WHERE DATE(v.date) >= DATE(?) AND DATE(v.date) <= DATE(?)';
    sqlParams = [];
    sqlParams.push(request.dateFrom);
    sqlParams.push(request.dateTo);

  } else {

    sql += '';
    sqlParams = [];

  }

  sql += !detailed ? ' GROUP BY v.uuid ' : '';

  return db.exec(sql, sqlParams);
}

function getSql(detailed) {
  let sql =
    `SELECT BUID(v.uuid) as uuid, v.date, v.project_id, v.currency_id, v.amount,
      v.description, v.user_id, v.type_id,
      CONCAT(u.first, ' - ', u.last) AS user,
      CONCAT(p.abbr, v.reference) AS reference,
      BUID(vi.document_uuid) AS document_uuid
    FROM voucher v
    JOIN voucher_item vi ON vi.voucher_uuid = v.uuid
    JOIN project p ON p.id = v.project_id
    JOIN user u ON u.id = v.user_id `;

  let detailedSql =
    `SELECT BUID(v.uuid) as uuid, v.date, v.project_id, v.currency_id, v.amount,
      v.description, v.user_id, v.type_id,
      BUID(vi.document_uuid) as document_uuid,
      BUID(vi.uuid) AS voucher_item_uuid,
      vi.account_id, vi.debit, vi.credit,
      a.number, a.label,
      CONCAT(u.first, ' - ', u.last) AS user,
      CONCAT(p.abbr, v.reference) AS reference
    FROM voucher v
    JOIN voucher_item vi ON vi.voucher_uuid = v.uuid
    JOIN project p ON p.id = v.project_id
    JOIN user u ON u.id = v.user_id
    JOIN account a ON a.id = vi.account_id `;

  return !util.nullString(detailed) ? detailedSql : sql;
}
