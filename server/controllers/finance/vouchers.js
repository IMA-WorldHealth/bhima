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
 */


const _ = require('lodash');
const uuid = require('node-uuid');

const util = require('../../lib/util');
const db = require('../../lib/db');

const BadRequest = require('../../lib/errors/BadRequest');
const identifiers = require('../../config/identifiers');
const FilterParser = require('../../lib/filter');

const entityIdentifier = identifiers.VOUCHER.key;

/** Get list of vouchers */
exports.list = list;

/** Get detail of vouchers */
exports.detail = detail;

/** Create a new voucher record */
exports.create = create;

exports.find = find;
exports.lookupVoucher = lookupVoucher;

/**
 * GET /vouchers
 *
 * @method list
 *
 * @description
 * Lists all the vouchers in the database.  Uses the FilterParser to ensure
 * that searching is supported.
 */
function list(req, res, next) {
  find(req.query)
    .then(rows => res.status(200).json(rows))
    .catch(next)
    .done();
}

/**
 * GET /vouchers/:uuid
 *
 * @method detail
 *
 * @description
 * This HTTP interface returns a single voucher in detail
 */
function detail(req, res, next) {
  lookupVoucher(req.params.uuid)
    .then(voucher => res.status(200).json(voucher))
    .catch(next)
    .done();
}

function lookupVoucher(vUuid) {
  let voucher;

  const sql = `
    SELECT BUID(v.uuid) as uuid, v.date, v.project_id, v.currency_id, v.amount,
      v.description, v.user_id, v.type_id,  u.display_name, transaction_type.text,
      CONCAT_WS('.', '${entityIdentifier}', p.abbr, v.reference) AS reference
    FROM voucher v
    JOIN project p ON p.id = v.project_id
    JOIN user u ON u.id = v.user_id
    LEFT JOIN transaction_type ON v.type_id = transaction_type.id
    WHERE v.uuid = ?;
  `;

  const itemSql = `
    SELECT BUID(vi.uuid) AS uuid, vi.debit, vi.credit, vi.account_id, a.number, a.label,
      BUID(vi.document_uuid) as document_uuid, document_map.text AS document_reference,
      BUID(entity_uuid) AS entity_uuid, entity_map.text AS entity_reference
    FROM voucher_item vi
    JOIN account a ON a.id = vi.account_id
    LEFT JOIN entity_map ON entity_map.uuid = vi.entity_uuid
    LEFT JOIN document_map ON document_map.uuid = vi.document_uuid
    WHERE vi.voucher_uuid = ?;
  `;

  return db.one(sql, [db.bid(vUuid)])
    .then((record) => {
      voucher = record;
      return db.exec(itemSql, [db.bid(vUuid)]);
    })
    .then((items) => {
      voucher.items = items;
      return voucher;
    });
}

function find(options) {
  db.convert(options, ['uuid', 'reference_uuid', 'entity_uuid']);

  const filters = new FilterParser(options, { tableAlias : 'v', autoParseStatements : false });
  const referenceStatement = `CONCAT_WS('.', '${entityIdentifier}', p.abbr, v.reference) = ?`;
  let typeIds = [];

  if (options.type_ids) {
    typeIds = typeIds.concat(options.type_ids);
  }

  const sql = `
    SELECT
      BUID(v.uuid) as uuid, v.date, v.project_id, v.currency_id, v.amount,
      v.description, v.user_id, v.type_id, u.display_name, transaction_type.text,
      CONCAT_WS('.', '${entityIdentifier}', p.abbr, v.reference) AS reference,
      BUID(v.reference_uuid) AS reference_uuid
    FROM voucher v
    JOIN project p ON p.id = v.project_id
    JOIN user u ON u.id = v.user_id
    LEFT JOIN transaction_type ON v.type_id = transaction_type.id
  `;

  delete options.detailed;

  filters.period('period', 'date');
  filters.dateFrom('custom_period_start', 'date');
  filters.dateTo('custom_period_end', 'date');
  filters.equals('user_id');

  filters.custom('reference', referenceStatement);

  filters.fullText('description');

  // @todo - could this be improved
  filters.custom('entity_uuid', 'v.uuid IN (SELECT DISTINCT voucher_uuid FROM voucher_item WHERE entity_uuid = ?)');

  filters.custom('type_ids', 'v.type_id IN (?)', typeIds);

  // @todo - could this be improved
  filters.custom('account_id', 'v.uuid IN (SELECT DISTINCT voucher_uuid FROM voucher_item WHERE account_id = ?)');

  // @TODO Support ordering query (reference support for limit)?
  filters.setOrder('ORDER BY v.date DESC');

  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();
  return db.exec(query, parameters);
}


/**
 * POST /vouchers
 *
 * @method create
 */
function create(req, res, next) {
  // alias both the voucher and the voucher items
  const voucher = req.body.voucher;
  let items = req.body.voucher.items || [];

  // a voucher without two items doesn't make any sense in double-entry
  // accounting.  Therefore, throw a bad data error if there are any fewer
  // than two items in the journal voucher.
  if (items.length < 2) {
    next(
      new BadRequest(
        `Expected there to be at least two items, but only received
        ${items.length} items.`
      )
    );

    return;
  }

  // remove the voucher items from the request before insertion into the
  // database
  delete voucher.items;
  delete voucher.reference;

  // convert dates to a date objects
  voucher.date = voucher.date ? new Date(voucher.date) : new Date();

  // attach session information
  voucher.user_id = req.session.user.id;
  voucher.project_id = req.session.project.id;

  // make sure the voucher has an id
  const vuid = voucher.uuid || uuid.v4();
  voucher.uuid = db.bid(vuid);

  // preprocess the items so they have uuids as required
  items.forEach((value) => {
    let item = value;
    // if the item doesn't have a uuid, create one for it.
    item.uuid = item.uuid || uuid.v4();

    // make sure the items reference the voucher correctly
    item.voucher_uuid = item.voucher_uuid || voucher.uuid;

    // convert the item's binary uuids
    item = db.convert(item, ['uuid', 'voucher_uuid', 'document_uuid', 'entity_uuid']);
  });

  // map items into an array of arrays
  items = _.map(items,
    util.take('uuid', 'account_id', 'debit', 'credit', 'voucher_uuid', 'document_uuid', 'entity_uuid')
  );

  // initialise the transaction handler
  const transaction = db.transaction();

  // build the SQL query
  transaction
    .addQuery('INSERT INTO voucher SET ?', [voucher])
    .addQuery(
      'INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid, document_uuid, entity_uuid) VALUES ?',
      [items])
    .addQuery('CALL PostVoucher(?);', [voucher.uuid]);

  transaction.execute()
    .then(() => res.status(201).json({ uuid : vuid }))
    .catch(next)
    .done();
}
