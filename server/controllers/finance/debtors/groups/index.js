/**
* The Debtor Groups Controllers
*
* This module is responsible for handling all CRUD operations on debtor groups
* and helper functions.
*
* @module finance/debtors/groups
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
 * @private
 */
function lookupDebtorGroup(uid) {
  const sql =
    `SELECT BUID(uuid) AS uuid, enterprise_id, name, account_id, BUID(location_id) as location_id,
      phone, email, note, locked, max_credit, is_convention, BUID(price_list_uuid) AS price_list_uuid,
      apply_subsidies, apply_discounts, apply_billing_services
    FROM debtor_group
    WHERE uuid = ?;`;

  return db.exec(sql, [uid])
  .then(function (rows) {
    if (!rows.length) {
      throw new NotFound(`Could not find a debtor group with uuid ${uuid.unparse(uid)}`);
    }

    return rows[0];
  });
}

/**
 * Converts incoming uuids into binary uuids, if they exist.  This works for both
 * PUT and POST requests
 *
 * @param {Object} data - the incoming data object to be inserted into the
 * database
 * @returns {object} data - the same data object, with uuids cast as binary.
 */
function convert(data) {

  if (data.location_id) {
    data.location_id = db.bid(data.location_id);
  }

  if (data.price_list_uuid) {
    data.price_list_uuid = db.bid(data.price_list_uuid);
  }

  return data;
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
  var sql = 'INSERT INTO debtor_group SET ? ;';

  // convert any incoming uuids into binary
  var data = convert(req.body);

  // generate a uuid if one doesn't exist, and convert to binary
  data.uuid = db.bid(data.uuid || uuid.v4());

  db.exec(sql, data)
  .then(function () {
    res.status(201).json({ uuid: uuid.unparse(data.uuid) });
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
  var sql = 'UPDATE debtor_group SET ? WHERE uuid = ?;';
  const uid = db.bid(req.params.uuid);

  // convert any incoming uuids to binary
  const data = convert(req.body);

  // prevent updating the uuid, if it exists
  delete data.uuid;

  db.exec(sql, [data, uid])
  .then(function (rows) {
    if (!rows.affectedRows) {
      throw new NotFound(
        `Could not find a debtor group with uuid ${req.params.uuid}`
      );
    }

    return lookupDebtorGroup(uid);
  })
  .then(function (group) {
    res.status(200).json(group);
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
  const uid = db.bid(req.params.uuid);

  lookupDebtorGroup(uid)
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
    'SELECT BUID(uuid) AS uuid, name, locked, account_id, is_convention, created_at FROM debtor_group ';

  if (req.query.detailed === '1') {

    /**
     * JOIN -> GROUP favoured over nested SELECT for potential performance reasons,
     * more modular solution would be:
     * (SELECT COUNT(uuid) from debtor where group_uuid = debtor_group.uuid) as total_debtors
     */
    sql =
      `
      SELECT BUID(debtor_group.uuid) as uuid, name, account_id, BUID(location_id) as location_id, phone, email, note, locked,
        max_credit, is_convention, BUID(price_list_uuid) as price_list_uuid, debtor_group.created_at,
        apply_subsidies, apply_discounts, apply_billing_services, COUNT(debtor.uuid) as total_debtors
      FROM debtor_group
      LEFT JOIN debtor
      ON debtor.group_uuid = debtor_group.uuid
      GROUP BY debtor_group.uuid
      `;

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
