'use strict';
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

const q  = require('q');
const uuid = require('node-uuid');
const db = require('../../../../lib/db');
const util = require('../../../../lib/util');
const NotFound = require('../../../../lib/errors/NotFound');

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
  let debtorGroup = {};

  const sql = `
    SELECT BUID(uuid) AS uuid, enterprise_id, name, account_id, BUID(location_id) as location_id,
      phone, email, note, locked, max_credit, is_convention, BUID(price_list_uuid) AS price_list_uuid,
      apply_subsidies, apply_discounts, apply_billing_services
    FROM debtor_group
    WHERE uuid = ?;
  `;

  return db.one(sql, [db.bid(uid)], uid, 'debtor group')
    .then(function (group) {
      debtorGroup = group;

      return lookupBillingServices(uid);
    })
    .then(function (billingServices) {
      debtorGroup.billingServices = billingServices;

      return lookupSubsidies(uid);
    })
    .then(function (subsidies) {
      debtorGroup.subsidies = subsidies;

      return debtorGroup;
    });
}

function lookupBillingServices(uid) {
  const sql = `
    SELECT billing_service_id, label, debtor_group_billing_service.created_at
    FROM debtor_group_billing_service
    LEFT JOIN billing_service ON debtor_group_billing_service.billing_service_id = billing_service.id
    WHERE debtor_group_uuid = ?
  `;

  return db.exec(sql, [db.bid(uid)]);
}

function lookupSubsidies(uid) {
  const sql = `
    SELECT label, subsidy_id, debtor_group_subsidy.created_at
    FROM debtor_group_subsidy
    LEFT JOIN subsidy ON debtor_group_subsidy.subsidy_id = subsidy.id
    WHERE debtor_group_uuid = ?
  `;

  return db.exec(sql, [db.bid(uid)]);
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
  const sql = 'INSERT INTO debtor_group SET ? ;';

  // convert any incoming uuids into binary
  const data = db.convert(req.body, ['price_list_uuid', 'location_id']);

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
  const data = db.convert(req.body, ['price_list_uuid', 'location_id']);

  // prevent updating the uuid, if it exists
  delete data.uuid;

  db.exec(sql, [data, uid])
  .then(function (rows) {
    if (!rows.affectedRows) {
      throw new NotFound(
        `Could not find a debtor group with uuid ${req.params.uuid}`
      );
    }

    return lookupDebtorGroup(req.params.uuid);
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
  lookupDebtorGroup(req.params.uuid)
    .then(group => res.status(200).json(group))
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
 * @function invoices
 *
 * @description This function is responsible for getting all invoices of a specified debtor group
 *
 */
function invoices(req, res, next) {
  var options = req.query;

  loadInvoices(req.params.uuid)
  .then(function (rows) {
    let data = rows;

    if (options.balanced) {
      data = rows.filter(item => {
        return item.balance === 0;
      });
    }

    if (options.unpaid) {
      data = rows.filter(item => {
        return item.balance !== 0;
      });
    }

    res.status(200).json(data);
  })
  .catch(next)
  .done();
}

/**
 * @method loadInvoices
 * @description This method returns invoices of a debtor group
 * @param {string} debtor_uuid A debtor group uuid
 */
function loadInvoices(debtor_uuid) {
  // get debtors of the group
  let sqlDebtors =
    `SELECT uuid FROM debtor WHERE debtor.group_uuid = ?;`;

  // get invoices balance for each debtor
  let sqlInvoices =
    `SELECT BUID(i.uuid) as uuid, i.date, CONCAT(project.abbr, i.reference) as reference,
      debit, credit, (debit - credit) as balance, BUID(entity_uuid) as entity_uuid
    FROM (
      SELECT record_uuid as uuid, combined_ledger.date, SUM(debit) as debit, SUM(credit) as credit,
        entity_uuid, invoice.reference, invoice.project_id
      FROM combined_ledger
      JOIN invoice ON combined_ledger.record_uuid = invoice.uuid OR combined_ledger.reference_uuid = invoice.uuid
      WHERE entity_uuid IN (?) AND invoice.uuid NOT IN (SELECT voucher.reference_uuid FROM voucher WHERE voucher.type_id = 10)
      GROUP BY uuid
    ) AS i
    JOIN project ON i.project_id = project.id
    WHERE i.uuid NOT IN (SELECT voucher.reference_uuid FROM voucher WHERE voucher.type_id = 10)
    HAVING balance <> 0`;

  let bid = db.bid(debtor_uuid);

  return db.exec(sqlDebtors, [bid])
  .then(result => {
    let uuids = result.map(item => item.uuid);
    return db.exec(sqlInvoices, [uuids]);
  });
}
