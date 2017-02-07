/**
 * @overview
 * Supplier Controller
 *
 * @description
 * This controller exposes an API to the client for reading and writing supplier
 */

'use strict';

const db = require('../../lib/db');
const uuid = require('node-uuid');
const NotFound = require('../../lib/errors/NotFound');
const Topic = require('../../lib/topic');

function lookupSupplier(uid) {
  const sql = `
    SELECT BUID(supplier.uuid) as uuid, BUID(supplier.creditor_uuid) as creditor_uuid, supplier.display_name,
      supplier.address_1, supplier.address_2, supplier.email, supplier.fax, supplier.note,
      supplier.phone, supplier.international, supplier.locked
    FROM supplier
    WHERE supplier.uuid = ?;
  `;

  return db.one(sql, [db.bid(uid)], uid, 'supplier');
}

/**
 * @method list
 *
 * @description
 * This method lists all suppliers registered in the database.
 */
function list(req, res, next) {
  let sql = `
    SELECT
      BUID(supplier.uuid) AS uuid, BUID(supplier.creditor_uuid) AS creditor_uuid, supplier.display_name,
      supplier.display_name, supplier.address_1, supplier.address_2, supplier.email, supplier.fax, supplier.note,
      supplier.phone, supplier.international, supplier.locked, BUID(creditor.group_uuid) AS creditor_group_uuid
    FROM supplier JOIN creditor ON supplier.creditor_uuid = creditor.uuid
  `;

  const locked = Number(req.query.locked);
  const params = [];

  if (!isNaN(locked)) {
    sql += 'WHERE supplier.locked = ?;';
    params.push(locked);
  }

  db.exec(sql, params)
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
 * GET /suppliers/:uuid
 *
 * Returns the detail of a single Supplier
 */
function detail(req, res, next) {
  lookupSupplier(req.params.uuid)
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}

/**
 * @method create
 *
 * @description
 * POST /supplier
 *
 * This method creates a new supplier entity in the database and sets up the
 * creditor for the it.
 */
function create(req, res, next) {
  const data = req.body;

  // provide uuid if the client has not specified
  const recordUuid = data.uuid || uuid.v4();
  const transaction = db.transaction();

  const creditorUuid = db.bid(uuid.v4());
  const creditorGroupUuid = db.bid(data.creditor_group_uuid);

  delete data.creditor_group_uuid;
  data.creditor_uuid = creditorUuid;
  data.uuid = db.bid(recordUuid);

  const writeCreditorQuery =
    'INSERT INTO creditor VALUES (?, ?, ?);';

  const writeSupplierQuery =
    'INSERT INTO supplier SET ?;';

  transaction
    .addQuery(writeCreditorQuery, [creditorUuid, creditorGroupUuid, data.display_name ])
    .addQuery(writeSupplierQuery, [data]);

  transaction.execute()
    .then(function () {

      Topic.publish(Topic.channels.INVENTORY, {
        event: Topic.events.CREATE,
        entity: Topic.entities.SUPPLIER,
        user_id: req.session.user.id,
        uuid: recordUuid
      });

      res.status(201).json({ uuid : recordUuid });
    })
    .catch(next)
    .done();
}

/**
 * @method update
 *
 * @description
 * PUT /suppliers/:uuid
 *
 * Updates a supplier in the database.
 */
function update(req, res, next) {
  const data = req.body;
  delete data.uuid;
  delete data.creditor_uuid;

  let creditorGroupUuid;
  if (data.creditor_group_uuid) {
    creditorGroupUuid = db.bid(data.creditor_group_uuid);
    delete data.creditor_group_uuid;
  }

  const updateSupplierQuery =
    'UPDATE supplier SET ? WHERE uuid = ?;';

  const updateCreditorQuery = `
    UPDATE creditor JOIN supplier ON creditor.uuid = supplier.creditor_uuid
    SET group_uuid = ? WHERE supplier.uuid = ?;
  `;

  const transaction = db.transaction();

  transaction
    .addQuery(updateSupplierQuery, [data, db.bid(req.params.uuid)]);

  if (creditorGroupUuid) {
    transaction.addQuery(updateCreditorQuery, [creditorGroupUuid, db.bid(req.params.uuid)]);
  }

  transaction.execute()
    .then(() => {

      Topic.publish(Topic.channels.INVENTORY, {
        event: Topic.events.UPDATE,
        entity: Topic.entities.SUPPLIER,
        user_id: req.session.user.id,
        uuid: req.params.uuid
      });

      return lookupSupplier(req.params.uuid);
    })
    .then(record => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

/**
 * @method search
 *
 * @description
 * GET /suppliers/search
 *
 * This method search for a supplier by their display_name.
 */
function search(req, res, next) {
  let limit = Number(req.query.limit);

  let sql = `
    SELECT BUID(supplier.uuid) as uuid, BUID(supplier.creditor_uuid) as creditor_uuid, supplier.display_name,
      supplier.address_1, supplier.address_2, supplier.email, supplier.fax, supplier.note, supplier.phone,
      supplier.international, supplier.locked, BUID(creditor.group_uuid) AS creditor_group_uuid
    FROM supplier JOIN creditor ON supplier.creditor_uuid = creditor.uuid
    WHERE supplier.display_name LIKE "%?%"
  `;

  if (!isNaN(limit)) {
    sql += 'LIMIT ' + Math.floor(limit) + ';';
  }

  db.exec(sql, [req.query.display_name])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}


// get list of a supplier
exports.list = list;

// get details of a supplier
exports.detail = detail;

// create a new supplier
exports.create = create;

// update supplier informations
exports.update = update;

// search suppliers data
exports.search = search;
