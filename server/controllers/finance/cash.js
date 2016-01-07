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
var uuid = require('uuid');

// check if an object is empty
function empty(object) {
  return Object.keys(object).length === 0;
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
 *
 */
exports.list = function list(req, res, next) {
  'use strict';

  // base query
  var sql =
    'SELECT cash.uuid, CONCAT(project.abbr, cash.reference) AS reference, ' +
      'cash.date, cash.cost '  +
    'FROM cash JOIN project ON cash.project_id = project.id;';

  // TODO - var hasKeys = !empty(req.query);

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
 * Get the details of a particular cash payment.
 *
 */
exports.details = function details(req, res, next) {
  'use strict';

  var sql, cashPayment = {};

  sql =
    'SELECT cash.uuid, CONCAT(project.abbr, cash.reference) AS reference, ' +
      'cash.cost, cash.date, cash.description, cash.debit_account, ' +
      'cash.credit_account, cash.currency_id, cash.type, cash.deb_cred_uuid, '  +
      'cash.deb_cred_type '

    ';';

  // TODO
};


/**
 * POST /cash
 * Creates a cash payment against several sales or a cautionary payment.
 */
exports.create = function create(req, res, next) {
  'use strict';

  var uid = uuid();

  // TODO
};
