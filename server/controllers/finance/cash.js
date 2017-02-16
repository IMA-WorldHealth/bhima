
/**
 * Cash Controller
 *
 *
 * This controller is responsible for processing cash payments for patients. The
 * payments can either be against an previous invoice (invoice payment) or a future
 * invoice (cautionary payment).
 *
 * In order to reduce the burden of accounting on the user, the user will first
 * select a cashbox which implicitly bundles in cash accounts for all supported
 * currencies.  The API accepts a cashbox ID during cash payment creation and
 * looks up the correct account based on the cashbox_id + currency.
 *
 * @module finance/cash
 *
 * @requires node-uuid
 * @requires lib/db
 * @requires cash.create
 * @requires lib/errors/NotFound
 * @requires lib/errors/BadRequest
 */

const uuid = require('node-uuid');
const _ = require('lodash');

const db   = require('../../lib/db');
const util = require('../../lib/util');

const NotFound = require('../../lib/errors/NotFound');
const BadRequest = require('../../lib/errors/BadRequest');

const identifiers = require('../../config/identifiers');
const barcode = require('../../lib/barcode');

const FilterParser = require('../../lib/filter');

const cashCreate = require('./cash.create');

const entityIdentifier = identifiers.CASH_PAYMENT.key;

/** retrieves the details of a cash payment */
exports.detail = detail;

/** retrieves a list of all cash payments */
exports.list = list;

/** creates cash payments */
exports.create = cashCreate;

/** modifies previous cash payments */
exports.update = update;

/** searches for a cash payment's uuid by their human-readable reference */
exports.reference = reference;

/** search cash payment by filtering */
exports.search = search;

/** lookup a cash payment by it's uuid */
exports.lookup = lookup;

/** list all cash payment */
exports.listPayment = listPayment;

/** checkInvoicePayment if the invoice is paid */
exports.checkInvoicePayment = checkInvoicePayment;


// looks up a single cash record and associated cash_items
function lookup(id) {
  const bid = db.bid(id);

  let record;

  const cashRecordSql = `
    SELECT BUID(cash.uuid) as uuid, cash.project_id,
      CONCAT_WS('.', '${identifiers.CASH_PAYMENT.key}', project.abbr, cash.reference) AS reference,
      cash.date, BUID(cash.debtor_uuid) AS debtor_uuid, cash.currency_id, cash.amount,
      cash.description, cash.cashbox_id, cash.is_caution, cash.user_id
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
    WHERE ci.cash_uuid = ?;
  `;

  return db.exec(cashRecordSql, [ bid ])
    .then(function (rows) {

      if (!rows.length) {
        throw new NotFound(`No cash record by uuid: ${id}`);
      }

      // store the record for return
      record = rows[0];

      return db.exec(cashItemsRecordSql, bid);
    })
    .then(function (rows) {

      // bind the cash items to the "items" property and return
      record.items = rows;

      record.barcode = barcode.generate(entityIdentifier, record.uuid);
      return record;
    });
}

/**
 *
 * @method list
 *
 * @description
 * Lists the cash payments with optional filtering parameters.
 *
 * GET /cash
 *
 * @returns {Array} payments - an array of { uuid, reference, date } JSONs
 */
function list(req, res, next) {
  listPayment()
    .then(function (rows) {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
 * @method search
 * @description search cash payment by some filters given
 */
 function search(req, res, next) {
   listPayment(req.query)
     .then(rows => {
       res.status(200).json(rows);
     })
     .catch(next)
     .done();
 }

/**
 * @method listPayment
 * @description list all payment made
 */
function listPayment(options) {
  let filters = new FilterParser(options, { tableAlias : 'cash' });

  let sql = `
    SELECT BUID(cash.uuid) as uuid, cash.project_id,
      CONCAT_WS('.', '${identifiers.CASH_PAYMENT.key}', project.abbr, cash.reference) AS reference,
      cash.date, BUID(cash.debtor_uuid) AS debtor_uuid, cash.currency_id, cash.amount,
      cash.description, cash.cashbox_id, cash.is_caution, cash.user_id,
      d.text AS debtor_name, cb.label AS cashbox_label, u.display_name,
      v.type_id, p.display_name AS patientName
    FROM cash
      LEFT JOIN voucher v ON v.reference_uuid = cash.uuid
      JOIN project ON cash.project_id = project.id
      JOIN debtor d ON d.uuid = cash.debtor_uuid
      JOIN patient p on p.debtor_uuid = d.uuid
      JOIN cash_box cb ON cb.id = cash.cashbox_id
      JOIN user u ON u.id = cash.user_id
  `;

  filters.dateFrom('dateFrom', 'date');
  filters.dateTo('dateTo', 'date');

  let referenceStatement = `CONCAT_WS('.', '${identifiers.CASH_PAYMENT.key}', project.abbr, cash.reference) = ?`;
  filters.custom('reference', referenceStatement);

  // @TODO Support ordering query (reference support for limit)?
  filters.setOrder('ORDER BY cash.date DESC');

  let query = filters.applyQuery(sql);
  let parameters = filters.parameters();
  return db.exec(query, parameters);
}

/**
 * @method detail
 *
 * @description
 * GET /cash/:uuid
 *
 * Get the details of a particular cash payment.
 */
function detail(req, res, next) {
  lookup(req.params.uuid)
    .then(function (record) {
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
    'currency_id', 'date', 'project_id'
  ];

  // loop through update keys and ensure that we are only updating non-protected
  // fields
  let keys = Object.keys(req.body);
  let hasProtectedKey = keys.some(function (key) {
      return protect.indexOf(key) > -1;
  });

  // if we have a protected key, emit an error
  if (hasProtectedKey) {
    throw new BadRequest('The update request attempted to change a protected field.', 'ERRORS.PROTECTED_FIELD');
  }

  // delete the uuid if it exists
  delete req.body.uuid;

  // properly parse date if it exists
  if (req.body.date) { req.body.date = new Date(req.body.date); }

  // if checks pass, we are free to continue with our updates to the db
  lookup(req.params.uuid)
    .then(function (record) {

      // if we get here, we know we have a cash record by this UUID.
      // we can try to update it.
      return db.exec(sql, [ req.body, db.bid(req.params.uuid)]);
    })
    .then(function () {

      // fetch the changed object from the database
      return lookup(req.params.uuid);
    })
    .then(function (record) {

      // all updates completed successfully, return full object to client
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

/**
 * GET /cash/references/:reference
 * retrieves cash payment uuids from a reference string (e.g. HBB123)
 */
function reference(req, res, next) {

  // alias the reference
  var ref = req.params.reference;

  const sql =
    `SELECT BUID(c.uuid) AS uuid FROM (
      SELECT cash.uuid
      FROM cash JOIN project ON cash.project_id = project.id
    )c WHERE c.reference = ?;`;

  db.one(sql, [ ref ], ref, 'cash')
    .then(function (payment) {
      // references should be unique - return the first one
      res.status(200).json(payment);
    })
    .catch(next)
    .done();
}

/**
 * GET /cash/:checkin/:invoiceUuid
 * Check if the invoice is paid
 */
function checkInvoicePayment(req, res, next) {
  const bid = db.bid(req.params.invoiceUuid);

  const REVERSAL_TYPE_ID = 10;

  const sql = `
    SELECT cash_item.cash_uuid, cash_item.invoice_uuid FROM cash_item
    WHERE cash_item.invoice_uuid = ?
    AND cash_item.cash_uuid NOT IN (
      SELECT voucher.reference_uuid FROM voucher WHERE voucher.type_id = ${REVERSAL_TYPE_ID}
    );
  `;

  db.exec(sql, [bid])
    .then(function (rows) {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}
