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
const db   = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');
const BadRequest = require('../../lib/errors/BadRequest');

const cashCreate = require('./cash.create');

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

/** lookup a cash payment by it's uuid */
exports.lookup = lookup;

// looks up a single cash record and associated cash_items
function lookup(id) {
  'use strict';

  const bid = db.bid(id);

  let record;

  const cashRecordSql = `
    SELECT BUID(cash.uuid) as uuid, cash.project_id, CONCAT(project.abbr, cash.reference) AS reference,
      cash.date, BUID(cash.debtor_uuid) AS debtor_uuid, cash.currency_id, cash.amount,
      cash.description, cash.cashbox_id, cash.is_caution, cash.user_id
    FROM cash JOIN project ON cash.project_id = project.id
    WHERE cash.uuid = ?;
  `;

  const cashItemsRecordSql = `
    SELECT BUID(ci.uuid) AS uuid, ci.amount, BUID(ci.invoice_uuid) AS invoice_uuid,
      CONCAT(p.abbr, i.reference) AS reference
    FROM cash_item AS ci
      JOIN invoice AS i ON ci.invoice_uuid = i.uuid
      JOIN project AS p ON i.project_id = p.id
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
  'use strict';

  const sql = `
    SELECT BUID(cash.uuid) AS uuid, CONCAT(project.abbr, cash.reference) AS reference,
      cash.date, cash.amount, cash.description 
    FROM cash JOIN project ON cash.project_id = project.id;
  `;

  db.exec(sql)
    .then(function (rows) {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
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
  'use strict';

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
  'use strict';

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
      SELECT cash.uuid, CONCAT(project.abbr, cash.reference) AS reference
      FROM cash JOIN project ON cash.project_id = project.id
    )c WHERE c.reference = ?;`;

  db.exec(sql, [ ref ])
  .then(function (rows) {
    if (!rows.length) {
      throw new NotFound(`No cash record with reference: ${ref}`);
    }

    // references should be unique - return the first one
    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
}
