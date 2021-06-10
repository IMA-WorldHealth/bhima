/**
 * The /vouchers HTTP API endpoint
 *
 * @module finance/vouchers
 *
 * @description This module is responsible for handling CRUD operations
 * against the `voucher` table.
 *
 * @requires lodash
 * @requires lib/util
 * @requires lib/db
 * @requires lib/ReportManager
 * @requires lib/errors/NotFound
 * @requires lib/errors/BadRequest
 */

const _ = require('lodash');

const util = require('../../lib/util');
const db = require('../../lib/db');

const BadRequest = require('../../lib/errors/BadRequest');
const FilterParser = require('../../lib/filter');

const shared = require('./shared');

/** Get list of vouchers */
exports.list = list;

/** Get detail of vouchers */
exports.detail = detail;

/** Create a new voucher record */
exports.create = create;
exports.createVoucher = createVoucher;

exports.find = find;
exports.lookupVoucher = lookupVoucher;
exports.safelyDeleteVoucher = safelyDeleteVoucher;
exports.totalAmountByCurrency = totalAmountByCurrency;

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
    .catch(next);
}

/**
 * @function lookupVoucher
 *
 * @description
 * Gets a single voucher (and associated details) by its uuid.
 */
async function lookupVoucher(vUuid) {
  const sql = `
    SELECT BUID(v.uuid) as uuid, v.date, v.created_at, v.project_id, v.currency_id, v.amount,
      v.description, v.user_id, v.type_id,  u.display_name, transaction_type.text,
      dm.text AS reference, reversed, v.posted
    FROM voucher v
    JOIN document_map dm ON dm.uuid = v.uuid
    JOIN project p ON p.id = v.project_id
    JOIN user u ON u.id = v.user_id
    LEFT JOIN transaction_type ON v.type_id = transaction_type.id
    WHERE v.uuid = ?;
  `;

  const itemSql = `
    SELECT BUID(vi.uuid) AS uuid, vi.debit, vi.credit, vi.account_id, a.number, a.label,
      BUID(vi.document_uuid) as document_uuid, document_map.text AS document_reference,
      BUID(entity_uuid) AS entity_uuid, entity_map.text AS entity_reference, vi.description
    FROM voucher_item vi
    JOIN account a ON a.id = vi.account_id
    LEFT JOIN entity_map ON entity_map.uuid = vi.entity_uuid
    LEFT JOIN document_map ON document_map.uuid = vi.document_uuid
    WHERE vi.voucher_uuid = ?
    ORDER BY vi.account_id DESC, vi.debit DESC, vi.credit ASC, entity_reference;
  `;

  const [voucher, items] = await Promise.all([
    db.one(sql, [db.bid(vUuid)]),
    db.exec(itemSql, [db.bid(vUuid)]),
  ]);

  voucher.items = items;

  return voucher;
}

// NOTE(@jniles) - this is used to find references for both vouchers and credit notes.
const REFERENCE_SQL = `
  v.uuid IN (
    SELECT DISTINCT voucher.uuid FROM voucher JOIN voucher_item
      ON voucher.uuid = voucher_item.voucher_uuid
    WHERE voucher_item.document_uuid = ? OR voucher.reference_uuid = ?
  )`;

function find(options) {
  db.convert(options, ['uuid', 'reference_uuid', 'entity_uuid', 'cash_uuid', 'invoice_uuid', 'stockReference']);

  const filters = new FilterParser(options, { tableAlias : 'v' });
  let typeIds = [];

  if (options.type_ids) {
    typeIds = typeIds.concat(options.type_ids);
  }

  const sql = `
    SELECT
      BUID(v.uuid) as uuid, v.date, v.project_id, v.currency_id, v.amount,
      v.description, v.user_id, v.type_id, u.display_name, transaction_type.text,
      dm.text AS reference, v.edited, BUID(v.reference_uuid) AS reference_uuid,
      p.name AS project_name, v.reversed
    FROM voucher v
    JOIN document_map dm ON v.uuid = dm.uuid
    JOIN project p ON p.id = v.project_id
    JOIN user u ON u.id = v.user_id
    LEFT JOIN transaction_type ON v.type_id = transaction_type.id
  `;

  delete options.detailed;

  filters.equals('uuid');
  filters.period('period', 'date');
  filters.dateFrom('custom_period_start', 'date');
  filters.dateTo('custom_period_end', 'date');
  filters.equals('user_id');
  filters.equals('project_id');
  filters.equals('edited');
  filters.equals('currency_id');

  filters.equals('reference', 'text', 'dm');

  filters.fullText('description');

  // @todo - could this be improved
  filters.custom('entity_uuid', 'v.uuid IN (SELECT DISTINCT voucher_uuid FROM voucher_item WHERE entity_uuid = ?)');

  filters.custom('type_ids', 'v.type_id IN (?)', [typeIds]);

  // @todo - could this be improved
  filters.custom('account_id', 'v.uuid IN (SELECT DISTINCT voucher_uuid FROM voucher_item WHERE account_id = ?)');

  filters.custom('invoice_uuid', REFERENCE_SQL, [options.invoice_uuid, options.invoice_uuid]);
  filters.custom('cash_uuid', REFERENCE_SQL, [options.cash_uuid, options.cash_uuid]);

  filters.custom('stockReference',
    `v.uuid IN (
      SELECT vi.voucher_uuid FROM voucher_item AS vi WHERE vi.document_uuid = ?
    )`);

  // reversed = 2 implies that we want to filter out both the inversed record and the inverted
  // record.
  if (options.reversed === '2') {
    // get all the uuids of all records matching the current search criteria
    const innerSQL = `
      SELECT v.uuid, v.reference_uuid, v.type_id, v.reversed FROM voucher v JOIN document_map dm ON v.uuid = dm.uuid
    `;

    // apply the query to the innerQuery, ignoring the LIMIT statement
    const innerQuery = filters.applyQuery(innerSQL, true);
    const innerParams = filters.parameters();
    const subquery = db.format(innerQuery, innerParams);

    // for some reason, NOT IN excludes NULL values.  Thata is why this query is so complicated.
    filters.custom('reversed', `v.reversed = 0 AND (
      v.reference_uuid IS NULL OR
      v.reference_uuid NOT IN (SELECT x.uuid FROM (${subquery}) AS x WHERE x.reversed = 1)
    )`.trim());
  } else {
    filters.equals('reversed');
  }

  // @TODO Support ordering query (reference support for limit)?
  filters.setOrder('ORDER BY v.date DESC, dm.text DESC');

  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();

  return db.exec(query, parameters);
}

function totalAmountByCurrency(options) {
  db.convert(options, ['uuid', 'reference_uuid', 'entity_uuid', 'cash_uuid', 'invoice_uuid']);

  const filters = new FilterParser(options, { tableAlias : 'v' });

  let typeIds = [];

  if (options.type_ids) {
    typeIds = typeIds.concat(options.type_ids);
  }

  const sql = `
  SELECT c.id as currencyId, c.symbol as currencySymbol, SUM(v.amount) as totalAmount, COUNT(c.symbol) AS numVouchers
  FROM voucher v
    JOIN document_map dm ON v.uuid = dm.uuid
    JOIN currency c ON v.currency_id = c.id
  `;

  delete options.detailed;

  filters.period('period', 'date');
  filters.dateFrom('custom_period_start', 'date');
  filters.dateTo('custom_period_end', 'date');
  filters.equals('user_id');
  filters.equals('edited');

  filters.equals('reference', 'text', 'dm');

  filters.fullText('description');

  // @todo - could this be improved
  filters.custom('entity_uuid', 'v.uuid IN (SELECT DISTINCT voucher_uuid FROM voucher_item WHERE entity_uuid = ?)');

  filters.custom('type_ids', 'v.type_id IN (?)', [typeIds]);

  // @todo - could this be improved
  filters.custom('account_id', 'v.uuid IN (SELECT DISTINCT voucher_uuid FROM voucher_item WHERE account_id = ?)');

  filters.custom('invoice_uuid', REFERENCE_SQL, [options.invoice_uuid, options.invoice_uuid]);
  filters.custom('cash_uuid', REFERENCE_SQL, [options.cash_uuid, options.cash_uuid]);

  filters.setOrder('ORDER BY v.date DESC');
  filters.setGroup('GROUP BY c.id');

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
  const { voucher } = req.body;

  createVoucher(voucher, req.session.user.id, req.session.project.id)
    .then((result) => res.status(201).json({ uuid : result.uuid }))
    .catch(next)
    .done();
}

function createVoucher(voucherDetails, userId, projectId) {
  let items = voucherDetails.items || [];

  const voucherType = voucherDetails.type_id;
  const updatesPaiementData = [];

  // a voucher without two items doesn't make any sense in double-entry
  // accounting.  Therefore, throw a bad data error if there are any fewer
  // than two items in the journal voucher.
  if (items.length < 2) {
    throw new BadRequest(`Expected there to be at least two items, but only received ${items.length} items.`);
  }

  // remove the voucher items from the request before insertion into the
  // database
  delete voucherDetails.items;
  delete voucherDetails.reference;

  // convert dates to a date objects
  voucherDetails.date = voucherDetails.date ? new Date(voucherDetails.date) : new Date();

  // attach session information
  voucherDetails.user_id = userId;
  voucherDetails.project_id = projectId;

  // make sure the voucher has an id
  const vuid = voucherDetails.uuid || util.uuid();
  voucherDetails.uuid = db.bid(vuid);

  const SALARY_PAYMENT_VOUCHER_TYPE_ID = 7;

  // preprocess the items so they have uuids as required
  items.forEach(value => {
    let item = value;

    // Only for Employee Salary Paiement
    if (voucherType === SALARY_PAYMENT_VOUCHER_TYPE_ID) {
      if (item.document_uuid) {
        const updatePaiement = `
          UPDATE paiement SET
            status_id = IF (((paiement.net_salary - paiement.amount_paid) = ?), 5, 4),
            paiement.amount_paid = amount_paid + ?,
            paiement.paiement_date = ?
          WHERE paiement.uuid = ? `;

        updatesPaiementData.push({
          query : updatePaiement,
          params : [item.debit, item.debit, voucherDetails.date, db.bid(item.document_uuid)],
        });
      }
    }

    // if the item doesn't have a uuid, create one for it.
    item.uuid = item.uuid || util.uuid();

    // make sure the items reference the voucher correctly
    item.voucher_uuid = item.voucher_uuid || voucherDetails.uuid;

    // convert the item's binary uuids
    item = db.convert(item, ['uuid', 'voucher_uuid', 'document_uuid', 'entity_uuid']);
  });

  // map items into an array of arrays
  items = _.map(
    items,
    util.take('uuid', 'account_id', 'debit', 'credit', 'voucher_uuid', 'document_uuid', 'entity_uuid'),
  );

  // initialise the transaction handler
  const transaction = db.transaction();

  // build the SQL query
  transaction
    .addQuery('INSERT INTO voucher SET ?', [voucherDetails])
    .addQuery(
      'INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid, document_uuid, entity_uuid) VALUES ?',
      [items],
    )
    .addQuery('CALL PostVoucher(?);', [voucherDetails.uuid]);

  // Only for Employee Salary Paiement
  if (voucherType === 7) {
    updatesPaiementData.forEach(updatePaiement => {
      transaction.addQuery(updatePaiement.query, updatePaiement.params);
    });
  }

  return transaction.execute()
    .then((transactionResult) => {
      return { uuid : vuid, transactionResult };
    });
}

/**
 * @function safelyDeleteVoucher
 *
 * @description
 * This function deletes a voucher from the system.  The method first checks
 * that a transaction can be deleted using the shared transaction library.
 * After removing the voucher, it also updates and "reversal" flags if necessary
 * to ensure that cash payments and invoices do not maintain broken links to
 * vouchers that have been deleted.
 */
function safelyDeleteVoucher(guid) {
  const DELETE_TRANSACTION = `
    DELETE FROM posting_journal WHERE record_uuid = ?;
  `;

  const DELETE_VOUCHER = `
    DELETE FROM voucher WHERE uuid = ?;
  `;

  const DELETE_DOCUMENT_MAP = `
    DELETE FROM document_map WHERE uuid = ?;
  `;

  // NOTE(@jniles) - this is a naive way of undoing reversals.  If no value is
  // matched, nothing happens.  This can be improved in the future by first
  // checking if the voucher's transaction_type is a reversal type, and then
  // performing or skipping this step based on that result.

  const TOGGLE_INVOICE_REVERSAL = `
    UPDATE invoice
      JOIN voucher ON invoice.uuid = voucher.reference_uuid
      SET invoice.reversed = 0
      WHERE voucher.uuid = ?;
  `;

  const TOGGLE_CASH_REVERSAL = `
    UPDATE cash
      JOIN voucher ON cash.uuid = voucher.reference_uuid
      SET cash.reversed = 0
      WHERE voucher.uuid = ?;
  `;

  const TOGGLE_VOUCHER_REVERSAL = `
      UPDATE voucher SET voucher.reversed = 0 WHERE voucher.uuid = ?;
  `;

  return shared.isRemovableTransaction(guid)
    .then(() => {
      const binaryUuid = db.bid(guid);
      const transaction = db.transaction();

      transaction
        .addQuery(DELETE_TRANSACTION, binaryUuid)

        // note that we have to delete the toggles before removing the voucher
        // wholesale.
        .addQuery(TOGGLE_INVOICE_REVERSAL, binaryUuid)
        .addQuery(TOGGLE_CASH_REVERSAL, binaryUuid)
        .addQuery(TOGGLE_VOUCHER_REVERSAL, binaryUuid)
        .addQuery(DELETE_VOUCHER, binaryUuid)
        .addQuery(DELETE_DOCUMENT_MAP, binaryUuid);

      return transaction.execute();
    });
}
