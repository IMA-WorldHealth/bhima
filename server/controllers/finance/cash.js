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
*/
var db   = require('../../lib/db');
var uuid = require('../../lib/guid');

// looks up a single cash record and associated cash_items
// sets the "canceled" flag if a cash_discard record exists.
function lookupCashRecord(uuid, codes) {
  'use strict';

  var record;
  var cashRecordSql =
    'SELECT cash.uuid, CONCAT(project.abbr, cash.reference) AS reference, ' +
      'cash.date, cash.debtor_uuid, cash.currency_id, cash.amount, ' +
      'cash.description, cash.cashbox_id, cash.is_caution, cash.user_id ' +
    'FROM cash JOIN project ON cash.project_id = project.id ' +
    'WHERE cash.uuid = ?;';

  var cashItemsRecordSql =
    'SELECT cash_item.uuid, cash_item.amount, cash_item.invoice_uuid ' +
    'FROM cash_item WHERE cash_item.cash_uuid = ?;';

  var cashDiscardRecordSql =
    'SELECT cash_uuid FROM cash_discard WHERE cash_uuid = ?;';

  return db.exec(cashRecordSql, [uuid])
  .then(function (rows) {

    if (rows.length === 0) {
      throw new codes.ERR_NOT_FOUND();
    }

    // store the record for return
    record = rows[0];

    return db.exec(cashItemsRecordSql, [uuid]);
  })
  .then(function (rows) {

    // bind the cash items to the "items" property and return
    record.items = rows;

    return db.exec(cashDiscardRecordSql, [uuid]);
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
 * TODO - Query Paramters:
 *   start={date}
 *   end={date}
 *   debtor={uuid}
 *   type={ 'cash' | 'caution' },
 *   project={id}
 *
 * Lists the cash payments with optional filtering parameters.
 * @returns payments An array of { uuid, reference, date } JSON objects
 */
exports.list = function list(req, res, next) {
  'use strict';

  // base query
  var sql =
    'SELECT cash.uuid, CONCAT(project.abbr, cash.reference) AS reference, ' +
      'cash.date, cash.amount '  +
    'FROM cash JOIN project ON cash.project_id = project.id;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

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
exports.getCashDetails = function details(req, res, next) {
  'use strict';

  var uuid = req.params.uuid;

  lookupCashRecord(uuid, req.codes)
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
};


/**
 * POST /cash
 * Creates a cash payment against several sales or a cautionary payment.  The
 * API also supports future offline functionality by either accepting a UUID or
 * generating it if it is not present.
 */
exports.create = function create(req, res, next) {
  'use strict';

  var data = req.body.payment;

  // generate a UUID if it not provided.
  // @TODO - should we validate that this is an _actual_ uuid, or should this
  // be sufficient?
  data.uuid = data.uuid || uuid();

  // trust the server's session info over the client's
  data.project_id = req.session.project.id;
  data.user_id = req.session.user.id;

  // format date for insertion into database
  if (data.date) { data.date = new Date(data.date); }

  // account for the cash items
  var items = data.items;

  // remove the cash items so that the SQL query is properly formatted
  delete data.items;

  // if items exist, tranform them into an array of arrays for db formatting
  if (items) {
    items = items.map(function (item) {
      item.uuid = item.uuid || uuid();
      item.cash_uuid = data.uuid;
      return [
        item.uuid, item.cash_uuid,
        item.amount, item.sale_uuid
      ];
    });
  }

  // disallow invoice payments with empty items.
  if (!data.is_caution && (!items || !items.length)) {
    return res.status(400).json({
      code : 'CASH.VOUCHER.ERRORS.NO_CASH_ITEMS',
      reason : 'You must submit cash items with the cash items payment.'
    });
  }

  var writeCashSql =
    'INSERT INTO cash SET ?;';

  var writeCashItemsSql =
    'INSERT INTO cash_item (uuid, cash_uuid, amount, invoice_uuid) ' +
    'VALUES ?;';

  var transaction = db.transaction();
  transaction.addQuery(writeCashSql, [ data ]);

  // only add the "items" query if we are NOT making a caution
  // cautions do not have items
  if (!data.is_caution) {
    transaction.addQuery(writeCashItemsSql, [ items ]);
  }

  transaction.execute()
  .then(function () {
    res.status(201).json({ uuid : data.uuid });
  })
  .catch(next)
  .done();
};


/**
 * PUT /cash/:uuid
 * Updates the non-financial details associated with a cash payment.
 * NOTE - this will not update the cash_item or cash_discard tables.
 */
exports.update = function update(req, res, next) {
  'use strict';

  var uuid = req.params.uuid;
  var updateSql = 'UPDATE cash SET ? WHERE uuid = ?;';

  // protected database fields that are unavailable for updates.
  var protect = [
    'is_caution', 'amount', 'user_id', 'cashbox_id',
    'currency_id', 'date', 'project_id'
  ];

  // loop through update keys and ensure that we are only updating non-protected
  // fields
  var keys = Object.keys(req.body);
  var hasProtectedKey = keys.some(function (key) {
      return protect.indexOf(key) > -1;
  });

  // if we have a protected key, emit an error
  if (hasProtectedKey) {
    return next(new req.codes.ERR_PROTECTED_FIELD());
  }

  // delete the uuid if it exists
  delete req.body.uuid;

  // properly parse date if it exists
  if (req.body.date) { req.body.date = new Date(req.body.date); }

  // if checks pass, we are free to continue with our updates to the db
  lookupCashRecord(uuid, req.codes)
  .then(function (record) {

    // if we get here, we know we have a cash record by this UUID.
    // we can try to update it.
    return db.exec(updateSql, [ req.body, req.params.uuid ]);
  })
  .then(function () {

    // fetch the changed object from the database
    return lookupCashRecord(uuid);
  })
  .then(function (record) {

    // all updates completed successfull, return full object to client
    res.status(200).json(record);
  })
  .catch(next)
  .done();
};

/**
 * DELETE /cash/:uuid
 * Reverses a cash payment using the cash discard table
 * @TODO - should this be implemented as a separate API?
 */
exports.debitNote = function debitNote(req, res, next) {
  'use strict';
  // TODO
  next();
};
