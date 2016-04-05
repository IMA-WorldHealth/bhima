/**
* The Debtor Groups Controllers
*
* @module finance/debtorGroups
*
* @desc This module is responsible for handling all crud operations relatives
* to debtor groups, and relatives functions.
*
* @requires q
* @requires node-uuid
* @requires lib/db
* @requires lib/util
* @requires lib/errors/NotFound
*/

var q  = require('q');
var uuid = require('node-uuid');
var db = require('../../../../lib/db');
var util = require('../../../../lib/util');
var NotFound = require('../../../../lib/errors/NotFound');

/** Create a new debtor group */
exports.create = create;

/** Update a debtor group */
exports.update = update;

/** Get debtor group details */
exports.detail = detail;

/** Get the list of debtor group */
exports.list = list;

/** [HTTP API ENDPOINT] get debtor groups invoices list */
exports.invoices = invoices;

/**
 * Looks up a debtor group in the database by uuid.
 *
 * @param {string} uuid - the uuid of the debtor group in question.
 * @returns {Promise} group - a promise resolving to the debtor group
 *
 * @private
 */
function lookupDebtorGroup(uid) {
  var sql =
    `SELECT uuid, enterprise_id ,name, account_id, location_id, phone, email,
      note, locked, max_credit, is_convention, price_list_uuid,
      apply_subsidies, apply_discounts, apply_billing_services
    FROM debitor_group
    WHERE uuid = ?;`;

  return db.exec(sql, [uid])
  .then(function (rows) {
    if (!rows.length) {
      throw new NotFound(`Could not find a debtor group with uuid ${uid}`);
    }

    return rows[0];
  });
}

/**
 * POST /debtor_groups/
 *
 * This function is responsible for creating a new debtor group.
 *
 * @function create
 * @example
 * {
 *   enterprise_id : {number},
 *   uuid : {uuid},
 *   name : {string},
 *   account_id : {number},
 *   location_id : {uuid},
 *   phone : {string},
 *   email : {string},
 *   note : {string},
 *   locked : {number},
 *   max_credit : {number},
 *   is_convention : {number},
 *   price_list_uuid : {uuid} or NULL,
 *   apply_discounts : {number},
 *   apply_billing_services : {number},
 *   apply_subsidies : {number}
 * };
 */
function create(req, res, next) {
  var data = req.body;
  var sql = 'INSERT INTO debitor_group SET ? ;';

  // generate a uuid if one doesn't exist
  data.uuid = data.uuid || uuid.v4();

  db.exec(sql, data)
  .then(function () {
    res.status(201).json({ uuid: data.uuid });
  })
  .catch(next)
  .done();
}

/**
 * PUT /debtor_groups/:uuid
 *
 * This function is responsible for updating a debtor group
 *
 * @function update
 */
function update(req, res, next) {
  var data = req.body;
  var sql = 'UPDATE debitor_group SET ? WHERE uuid = ?;';

  // prevent updating the uuid, if it exists
  delete data.uuid;

  db.exec(sql, [data, req.params.uuid])
  .then(function (rows) {
    if (!rows.affectedRows) {
      throw new NotFound(
        `Could not find a debtor group with uuid ${req.params.uuid}`
      );
    }

    return lookupDebtorGroup(req.params.uuid);
  })
  .then(function (group) {
    res.status(200).send(group);
  })
  .catch(next)
  .done();
}

/**
* GET /debtor_groups/:uuid
*
* This function is responsible for retrieving details of a debtor group
*
* @function detail
*/
function detail(req, res, next) {
  var uuid = req.params.uuid;

  lookupDebtorGroup(uuid)
  .then(function (group) {
    res.status(200).json(group);
  })
  .catch(next)
  .done();
}

/**
 * GET /debtor_groups
 *
 * This function is responsible for retrieving list of debtor groups.
 *
 * @param {boolean} is_convention  (0 | 1) filter debtor groups in the convention column
 * @param {boolean} locked (0 | 1) filters locked debtor groups
 * @function list
 */
function list(req, res, next) {
  var sql =
    'SELECT uuid, name, locked, account_id, is_convention FROM debitor_group ';

  if (req.query.detailed === '1') {
    sql =
      `SELECT uuid, name, account_id, location_id, phone, email, note, locked,
        max_credit, is_convention, price_list_uuid,
        apply_subsidies, apply_discounts, apply_billing_services
      FROM debitor_group `;

    delete req.query.detailed;
  }

  var queryObject = util.queryCondition(sql, req.query);

  db.exec(queryObject.query, queryObject.conditions)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
 * GET /debtor_groups/{:uuid}/invoices?balanced=1
 *
 * This function is responsible for getting all invoices of a specified debtor group
 *
 * @function invoices
 * @todo - implement this following the design in debtors/index.js
 */
function invoices(req, res, next) {
  var options = req.query;

  if (options.balanced) { options.balanced = Boolean(options.balanced); }

  res.status(500).send('Unimplemented..');

  /*
  invoices(req.params.uuid, options)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
  */
}
