/**
* Cash Controller
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

// check if an object is empty
// TODO - can this be from a library?
function empty(object) {
  return Object.keys(object).length === 0;
}


// looks up a single cash record and associated cash_items
// sets the "canceled" flag if a cash_discard record exists.
function lookupCashRecord(uuid, codes) {
  'use strict';

  var record;
  var cashRecordSql =
    'SELECT cash.uuid, CONCAT(project.abbr, cash.reference) AS reference, ' +
      'cash.date, cash.debtor_uuid, cash.currency_id, cash.amount, ' +
      'cash.description, cash.cashbox_id, cash.is_caution ' +
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
      throw codes.ERR_NOT_FOUND;
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
exports.details = function details(req, res, next) {
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
 * Creates a cash payment against several sales or a cautionary payment.
 */
exports.create = function create(req, res, next) {
  'use strict';
  // TODO
};


/**
 * PUT /cash/:uuid
 * Updates the non-financial details associated with a cash payment.
 * NOTE - this will not update the cash_item or cash_discard tables.
 */
exports.update = function update(req, res, next) {
  'use strict';

  var uuid = req.params.uuid;
  var updateSql = 'UPDATE cash SET ?;';

  // protected database fields that are unavailable for updates.
  var protect = [
    'is_caution', 'amount', 'user_id', 'cashbox_id',
    'currency_id', 'date', 'uuid', 'project_id'
  ];

  // loop through update keys and ensure that we are only updating non-protected
  // fields
  var keys = Object.keys(req.body);
  var hasProtectedKey = keys.some(function (key) {
      return protect.indexOf(key) > -1;
  });

  // if we have a protected key, emit an error
  if (hasProtectedKey) {
    return next('ERR_PROTECTED_FIELD');
  }

  // if checks pass, we are free to continue with our updates to the db
  lookupCashRecord(uuid, req.codes)
  .then(function (record) {

    // if we get here, we know we have a cash record by this UUID.
    // we can try to update it.
    return db.exec(updateSql, [ req.body ]);
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
};
