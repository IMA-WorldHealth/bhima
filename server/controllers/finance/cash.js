/**
 * Cash Controller
 *
 * This controller is responsible for processing cash payments for patients. The
 * payments can either be against an previous invoice (invoice payment) or a
 * future invoice (cautionary payment).
 *
 * In order to reduce the burden of accounting on the user, the user will first
 * select a cashbox which implicitly bundles in cash accounts for all supported
 * currencies.  The API accepts a cashbox ID during cash payment creation and
 * looks up the correct account based on the cashbox_id + currency.
 * @module finance/cash
 *
 * @requires lib/db
 * @requires lib/filters
 * @requires lib/barcode
 * @requires lib/errors/NotFound
 * @requires lib/errors/BadRequest
 * @requires config/identifiers
 * @requires cash.create
 */

const _ = require('lodash');

const db = require('../../lib/db');
const barcode = require('../../lib/barcode');
const FilterParser = require('../../lib/filter');
const { BadRequest, NotFound } = require('../../lib/errors');
const identifiers = require('../../config/identifiers');
const cashCreate = require('./cash.create');

// shared transaction methods
// TODO(@jniles) - find a better name
const shared = require('./shared');

exports.detail = detail;
exports.read = read;
exports.create = cashCreate;
exports.update = update;
exports.lookup = lookup;
exports.find = find;
exports.checkInvoicePayment = checkInvoicePayment;
exports.safelyDeleteCashPayment = safelyDeleteCashPayment;

const CASH_KEY = identifiers.CASH_PAYMENT.key;

// looks up a single cash record and associated cash_items
function lookup(uuid) {
  const bid = db.bid(uuid);

  let record;

  const cashRecordSql = `
    SELECT BUID(cash.uuid) as uuid, cash.project_id,
      CONCAT_WS('.', '${CASH_KEY}', project.abbr, cash.reference) AS reference,
      cash.date, BUID(cash.debtor_uuid) AS debtor_uuid, cash.currency_id, cash.amount,
      cash.description, cash.cashbox_id, cash.is_caution, cash.user_id, cash.edited
    FROM cash JOIN project ON cash.project_id = project.id
    WHERE cash.uuid = ?;
  `;

  const cashItemsRecordSql = `
    SELECT BUID(ci.uuid) AS uuid, ci.amount, BUID(ci.invoice_uuid) AS invoice_uuid, s.name AS serviceName,
      CONCAT_WS('.', '${identifiers.INVOICE.key}', p.abbr, i.reference) AS reference
    FROM cash_item AS ci
      JOIN invoice AS i ON ci.invoice_uuid = i.uuid
      JOIN project AS p ON i.project_id = p.id
      LEFT JOIN service AS s ON i.service_id = s.id
    WHERE ci.cash_uuid = ?
    ORDER BY i.date ASC;
  `;

  return db.exec(cashRecordSql, [bid])
    .then((rows) => {
      if (!rows.length) {
        throw new NotFound(`No cash record by uuid: ${uuid}`);
      }

      // store the record for return
      [record] = rows;

      return db.exec(cashItemsRecordSql, bid);
    })
    .then((rows) => {
      // bind the cash items to the "items" property and return
      record.items = rows;

      record.barcode = barcode.generate(CASH_KEY, record.uuid);
      return record;
    });
}

/**
 *
 * @method read
 *
 * @description
 * Lists the cash payments with optional filtering parameters.
 * search cash payment by some filters given
 *
 * GET /cash
 *
 * @returns {Array} payments - an array of { uuid, reference, date } JSONs
 */
function read(req, res, next) {
  find(req.query)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
 * @method find
 *
 * @description
 * This method uses the FilterParser library to compose a query matching the
 * query parameters passed in via the options object.
 *
 * @param {Object} options - a series of key/value pairs to be used for
 *    filtering the cash table.
 */
function find(options) {
  // ensure expected options are parsed appropriately as binary
  db.convert(options, ['debtor_uuid', 'debtor_group_uuid', 'invoice_uuid']);
  const filters = new FilterParser(options, { tableAlias : 'cash' });

  const sql = `
    SELECT BUID(cash.uuid) as uuid, cash.project_id,
      CONCAT_WS('.', '${CASH_KEY}', project.abbr, cash.reference) AS reference,
      cash.date, BUID(cash.debtor_uuid) AS debtor_uuid, cash.currency_id, cash.amount,
      cash.description, cash.cashbox_id, cash.is_caution, cash.user_id, cash.reversed,
      d.text AS debtor_name, cb.label AS cashbox_label, u.display_name,
      p.display_name AS patientName, cash.edited
    FROM cash
      JOIN project ON cash.project_id = project.id
      JOIN debtor d ON d.uuid = cash.debtor_uuid
      JOIN patient p on p.debtor_uuid = d.uuid
      JOIN cash_box cb ON cb.id = cash.cashbox_id
      JOIN user u ON u.id = cash.user_id
  `;

  filters.dateFrom('custom_period_start', 'date');
  filters.dateTo('custom_period_end', 'date');
  filters.equals('cashbox_id');
  filters.equals('currency_id');
  filters.equals('debtor_group_uuid', 'group_uuid', 'd');
  filters.equals('debtor_uuid');
  filters.equals('edited');
  filters.equals('is_caution');
  filters.equals('reversed');
  filters.equals('user_id');
  filters.fullText('description');
  filters.period('period', 'date');

  // TODO - re-write these use document maps and entity maps
  const referenceStatement = `CONCAT_WS('.', '${CASH_KEY}', project.abbr, cash.reference) = ?`;
  filters.custom('reference', referenceStatement);

  const patientReferenceStatement = `CONCAT_WS('.', '${identifiers.PATIENT.key}', project.abbr, p.reference) = ?`;
  filters.custom('patientReference', patientReferenceStatement);

  // @TODO Support ordering query (reference support for limit)?
  filters.setOrder('ORDER BY cash.date DESC');

  filters.custom(
    'invoice_uuid',
    'cash.uuid IN (SELECT cash_item.cash_uuid FROM cash_item WHERE cash_item.invoice_uuid = ?)'
  );

  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();

  return db.exec(query, parameters);
}

/**
 * @method detail
 *
 * @description
 * Get the details of a particular cash payment.  Expects a uuid.
 * GET /cash/:uuid
 */
function detail(req, res, next) {
  lookup(req.params.uuid)
    .then(record => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

/**
 * PUT /cash/:uuid
 * Updates the non-financial details associated with a cash payment.
 * NOTE - this will not update the cash_item.
 *
 * @todo - remove protected fields check -- the database should do this
 * automatically
 */
function update(req, res, next) {
  const sql = 'UPDATE cash SET ? WHERE uuid = ?;';

  // protected database fields that are unavailable for updates.
  const protect = [
    'is_caution', 'amount', 'user_id', 'cashbox_id',
    'currency_id', 'date', 'project_id',
  ];

  // loop through update keys and ensure that we are only updating non-protected
  // fields
  const keys = Object.keys(req.body);
  const hasProtectedKey = keys.some(key => protect.indexOf(key) > -1);

  // if we have a protected key, emit an error
  if (hasProtectedKey) {
    throw new BadRequest('The update request attempted to change a protected field.', 'ERRORS.PROTECTED_FIELD');
  }

  // delete the uuid if it exists
  delete req.body.uuid;

  // properly parse date if it exists
  if (req.body.date) {
    _.extend(req.body, { date : new Date(req.body.date) });
  }

  // if checks pass, we are free to continue with our updates to the db
  lookup(req.params.uuid)

    // if we get here, we know we have a cash record by this UUID.
    // we can try to update it.
    .then(() => db.exec(sql, [req.body, db.bid(req.params.uuid)]))
    .then(() => lookup(req.params.uuid))
    .then((record) => {
      // all updates completed successfully, return full object to client
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

/**
 * GET /cash/:checkin/:invoiceUuid
 * Check if the invoice is paid
 * TODO(@jniles) - this should use a more intelligent system to see if an
 * invoice is referenced ... probably by scanning the ledgers for any
 * referencing transactions.
 */
function checkInvoicePayment(req, res, next) {
  const bid = db.bid(req.params.invoiceUuid);

  const sql = `
    SELECT cash.reversed, cash_item.cash_uuid, cash_item.invoice_uuid FROM cash JOIN cash_item
    WHERE cash_item.invoice_uuid = ? AND cash.reversed <> 1
    GROUP BY cash_item.invoice_uuid;
  `;

  db.exec(sql, [bid])
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
 * @function safelyDeleteCashPayment
 *
 * @description
 * This function deletes the cash payment from the system.  It assumes that
 * checks have already been made for referencing transactions.
 */
function safelyDeleteCashPayment(uuid) {
  const DELETE_TRANSACTION = `
    DELETE FROM posting_journal WHERE record_uuid = ?;
  `;

  const DELETE_CASH_PAYMENT = `
    DELETE FROM cash WHERE uuid = ?;
  `;

  const DELETE_TRANSACTION_HISTORY = `
    DELETE FROM transaction_history WHERE record_uuid = ?;
  `;

  const DELETE_DOCUMENT_MAP = `
    DELETE FROM document_map WHERE uuid = ?;
  `;

  return shared.isRemovableTransaction(uuid)
    .then(() => {
      const binaryUuid = db.bid(uuid);
      const transaction = db.transaction();

      transaction
        .addQuery(DELETE_TRANSACTION, binaryUuid)
        .addQuery(DELETE_TRANSACTION_HISTORY, binaryUuid)
        .addQuery(DELETE_CASH_PAYMENT, binaryUuid)
        .addQuery(DELETE_DOCUMENT_MAP, binaryUuid);

      return transaction.execute();
    });
}
