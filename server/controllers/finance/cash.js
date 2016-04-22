/**
* Cash Controller
*
* @module finance/cash
*
* This controller is responsible for processing cash payments for patients. The
* payments can either be against an previous invoice (sale payment) or a future
* invoice (cautionary payment).
*
* In order to reduce the burden of accounting on the user, the user will first
* select a cashbox which implicitly bundles in cash accounts for all supported
* currencies.  The API accepts a cashbox ID during cash payment creation and
* looks up the correct account based on the cashbox_id + currency.
*
* @requires node-uuid
* @requires lib/db
* @requires lib/errors/NotFound
* @requires lib/errors/BadRequest
* @requires journal/cash
*/
const uuid = require('node-uuid');
const db   = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');
const BadRequest = require('../../lib/errors/BadRequest');
const journal = require('./journal/cash');

/** retrieves the details of a cash payment */
exports.detail = detail;

/** retrieves a list of all cash payments */
exports.list = list;

/** creates cash payments */
exports.create = create;

/** modifies previous cash payments */
exports.update = update;

/** searchs for cash payment uuids by their human-readable reference */
exports.reference = reference;

/** @todo - reverse a cash payment via a journal voucher */
exports.debitNote = debitNote;

// looks up a single cash record and associated cash_items
// sets the "canceled" flag if a cash_discard record exists.
function lookupCashRecord(id) {
  'use strict';

  let record;

  const cashRecordSql =
    `SELECT BUID(cash.uuid) as uuid, cash.project_id, CONCAT(project.abbr, cash.reference) AS reference,
      cash.date, cash.debtor_uuid, cash.currency_id, cash.amount,
      cash.description, cash.cashbox_id, cash.is_caution, cash.user_id
    FROM cash JOIN project ON cash.project_id = project.id
    WHERE cash.uuid = ?;`;

  const cashItemsRecordSql =
    `SELECT BUID(cash_item.uuid) AS uuid, cash_item.amount, BUID(cash_item.invoice_uuid) as invoice_uuid
    FROM cash_item WHERE cash_item.cash_uuid = ?;`;

  const cashDiscardRecordSql =
    'SELECT BUID(cash_uuid) AS uuid FROM cash_discard WHERE cash_uuid = ?;';

  return db.exec(cashRecordSql, [ id ])
  .then(function (rows) {

    if (rows.length === 0) {
      throw new NotFound(`No cash record by uuid: ${uuid.unparse(id)}`);
    }

    // store the record for return
    record = rows[0];

    return db.exec(cashItemsRecordSql, id);
  })
  .then(function (rows) {

    // bind the cash items to the "items" property and return
    record.items = rows;

    return db.exec(cashDiscardRecordSql, id);
  })
  .then(function (rows) {

    // if a linked cash_discard record exists, it means that this cash record
    // has been reversed and we'll report that using a 'canceled' flag.
    record.canceled = rows.length > 0;

    return record;
  });
}

/**
 * GET /cash
 * Lists the cash payments with optional filtering parameters.
 *
 * @returns {array} payments - an array of { uuid, reference, date } JSONs
 */
function list(req, res, next) {
  'use strict';

  const sql =
    `SELECT BUID(cash.uuid) AS uuid, CONCAT(project.abbr, cash.reference) AS reference,
      cash.date, cash.amount 
    FROM cash JOIN project ON cash.project_id = project.id;`;

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
 * GET /cash/:uuid
 *
 * Get the details of a particular cash payment.  This endpoint will return a
 * record in the following format:
 * {
 *   uuid : "..",
 *   items : [ {}, {} ]    // items hitting invoices, if applicable
 *   is_caution : true/false,
 *   canceled: true/false, // indicates if a cash_discard record exists
 *   ...
 *  }
 */
function detail(req, res, next) {
  'use strict';

  const uid = db.bid(req.params.uuid);

  lookupCashRecord(uid)
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}


/**
 * POST /cash
 * Creates a cash payment against one or many previous sales or a cautionary
 * payment.  If a UUID is not provided, one is automatically generated.
 */
function create(req, res, next) {
  'use strict';

  // alias insertion data
  let data = req.body.payment;

  // generate a UUID if it not provided.
  data.uuid = db.bid(data.uuid || uuid.v4());

  // trust the server's session info over the client's
  data.project_id = req.session.project.id;
  data.user_id = req.session.user.id;

  if (data.debtor_uuid) {
    data.debtor_uuid = db.bid(data.debtor_uuid);
  }

  // format date for insertion into database
  if (data.date) { data.date = new Date(data.date); }

  // account for the cash items
  let items = data.items;

  // remove the cash items so that the SQL query is properly formatted
  delete data.items;

  // if items exist, transform them into an array of arrays for db formatting
  if (items) {
    items = items.map(function (item) {
      item.cash_uuid = data.uuid;
      return [
        db.bid(item.uuid || uuid.v4()),
        item.cash_uuid,
        item.amount,
        db.bid(item.sale_uuid)
      ];
    });
  }

  // disallow invoice payments with empty items by returning a 400 to the client
  if (!data.is_caution && (!items || !items.length)) {
    return next(
      new BadRequest('You must submit cash items with the cash items payment.')
    );
  }

  const writeCashSql =
    'INSERT INTO cash SET ?;';

  const writeCashItemsSql =
    `INSERT INTO cash_item (uuid, cash_uuid, amount, invoice_uuid)
    VALUES ?;`;

  let transaction = db.transaction();
  transaction.addQuery(writeCashSql, [ data ]);

  // only add the "items" query if we are NOT making a caution
  // cautions do not have items
  if (!data.is_caution) {
    transaction.addQuery(writeCashItemsSql, [ items ]);
  }

  transaction.execute()
  .then(function () {
    res.status(201).json({
      uuid : uuid.unparse(data.uuid)
    });
  })
  .catch(next)
  .done();
}


/**
 * PUT /cash/:uuid
 * Updates the non-financial details associated with a cash payment.
 * NOTE - this will not update the cash_item or cash_discard tables.
 *
 * @todo - remove protected fields check -- the database should do this
 * automatically
 */
function update(req, res, next) {
  'use strict';

  const uid = db.bid(req.params.uuid);
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
  lookupCashRecord(uid)
  .then(function (record) {

    // if we get here, we know we have a cash record by this UUID.
    // we can try to update it.
    return db.exec(sql, [ req.body, uid ]);
  })
  .then(function () {

    // fetch the changed object from the database
    return lookupCashRecord(uid);
  })
  .then(function (record) {

    // all updates completed successfully, return full object to client
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}

/**
 * DELETE /cash/:uuid
 * Reverses a cash payment using the cash discard table
 * @TODO - should this be implemented as a separate API?
 */
function debitNote(req, res, next) {
  'use strict';
  // TODO
  next();
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
    if (rows.length === 0) {
      throw new NotFound(`No cash record with reference: ${ref}`);
    }

    // references should be unique - return the first one
    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
}
