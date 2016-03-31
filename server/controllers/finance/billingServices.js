/**
 * The /billing_service API module
 *
 * @module finance/billingServices
 *
 * @desc This module is responsible for CRUD operations on the billing_service
 * table.  A billing_service increases a patient's invoice by a set percentage
 * of the total invoice amount.
 *
 * @required lib/db
 *
 */
var db = require('../../lib/db');


/**
 * Looks up a billing service by id.
 *
 * @param id {Number} The billing service id
 * @param codes {Object} An object of error codes
 * @returns billingService {Promise} A promise resolvinng to the billing
 * service entity.
 */
function lookupBillingService(id, codes) {
  'use strict';

  var sql =
    'SELECT bs.id, bs.account_id, bs.label, bs.description, bs.value, ' +
      'bs.created_at, bs.updated_at, a.number ' +
    'FROM billing_service AS bs JOIN account AS a ON bs.account_id = a.id ' +
    'WHERE bs.id = ?;';

  return db.exec(sql, [ id ])
  .then(function (rows) {

    // if no records matching, throw a 404
    if (rows.length === 0) {
      throw new codes.ERR_NOT_FOUND();
    }

    // return a single JSON of the record
    return rows[0];
  });
}


/**
 * GET /billing_services/:id
 *
 * @desc get the details of a single billing service.
 */
exports.detail = function detail(req, res, next) {
  'use strict';

  // looks up the billing service by ID
  lookupBillingService(req.params.id, req.codes)
  .then(function (billingService) {
    res.status(200).json(billingService);
  })
  .catch(next)
  .done();
};


/**
 * GET /billing_services
 *
 * @desc list all billing services in the database.
 */
exports.list = function list(req, res, next) {
  'use strict';

  var sql =
    'SELECT bs.id, bs.label, bs.created_at ' +
    'FROM billing_service AS bs ' +
    'ORDER BY bs.label;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};


/**
 * POST /billing_services
 *
 * @desc creates a new billing service
 */
exports.create = function create(req, res, next) {
  'use strict';

  // cache posted data for easy lookup
  var data = req.body.billingService;

  // delete the id if it exists -- the db will create one via auto-increment
  delete data.id;

  // ensure that values inserted are positive
  if (data.value <= 0) {
    return next(new req.codes.ERR_NEGATIVE_VALUES());
  }

  var sql =
    'INSERT INTO billing_service (account_id, label, description, value) ' +
    'VALUES (?, ?, ?, ?);';

  db.exec(sql, [ data.account_id, data.label, data.description, data.value ])
  .then(function (results) {

    // return the id to the client for future lookups.
    res.status(201).json({ id : results.insertId });
  })
  .catch(next)
  .done();
};


/**
 * PUT /billing_services/:id
 *
 * @desc updates an existing billing service with new information
 */
exports.update = function update(req, res, next) {
  'use strict';

  // cache the id
  var id = req.params.id;
  var data = req.body.billingService;

  // remove the :id if it exists inside the billingService object
  delete data.id;

  var sql =
    'UPDATE billing_service SET ? WHERE id = ?;';

  // ensure that the billing service matching :id exists
  lookupBillingService(id, req.codes)
  .then(function () {
    return db.exec(sql, [ data, req.params.id ]);
  })
  .then(function () {

    // return the full changed object
    return lookupBillingService(id, req.codes);
  })
  .then(function (billingService) {
    res.status(200).json(billingService);
  })
  .catch(next)
  .done();
};


/**
 * DELETE /billing_services/:id
 *
 * @desc deletes a billing service in the database
 */
exports.delete = function del(req, res, next) {
  'use strict';

  var sql =
    'DELETE FROM billing_service WHERE id = ?;';

  // first make sure that the billing service exists
  lookupBillingService(req.params.id, req.codes)
  .then(function () {
    return db.exec(sql, [ req.params.id ]);
  })
  .then(function () {
    res.status(204).json();
  })
  .catch(next)
  .done();
};
