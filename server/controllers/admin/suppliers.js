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

function lookupSupplier(uuid) {
  const sql = `
    SELECT BUID(supplier.uuid) as uuid, BUID(supplier.creditor_uuid) as creditor_uuid, supplier.name,
      supplier.address_1, supplier.address_2, supplier.email, supplier.fax, supplier.note,
      supplier.phone, supplier.international, supplier.locked
    FROM supplier
    WHERE supplier.uuid = ?;
  `;

  return db.exec(sql, [db.bid(uuid)])
    .then(function (rows) {
      if (!rows.length) {
        throw new NotFound(`Could not find a supplier with uuid ${uuid}`);
      }

      return rows[0];
    });
}

/**
 * @method list
 *
 * @description
 * This method lists all suppliers registered in the database.
 */
function list(req, res, next) {
  let sql = `
    SELECT BUID(supplier.uuid) as uuid, BUID(supplier.creditor_uuid) as creditor_uuid,
      supplier.name, supplier.address_1, supplier.address_2, supplier.email,
      supplier.fax, supplier.note, supplier.phone, supplier.international, supplier.locked
    FROM supplier
  `;

  if (req.query.locked === '0') {
    sql += 'WHERE supplier.locked = 0 ';
  }

  if (req.query.locked === '1') {
    sql += 'WHERE supplier.locked = 1 ';
  }

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
  const data = db.convert(req.body, ['creditor_uuid']);

  // provide uuid if the client has not specified
  const uid = data.uuid || uuid();
  data.uuid = db.bid(uid);

  let sql =
    'INSERT INTO supplier SET ? ';

  db.exec(sql, [data])
  .then(function (row) {

    Topic.publish(Topic.channels.INVENTORY, {
      event: Topic.events.CREATE,
      entity: Topic.entities.SUPPLIER,
      user_id: req.session.user.id,
      uuid: uid
    });

    res.status(201).json({ uuid : uid });
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
 * Updates a supplier in the datababase.
 */
function update(req, res, next) {
  let sql =
    'UPDATE supplier SET ? WHERE uuid = ?;';

  const data = db.convert(req.body, ['creditor_uuid']);

  // prevent updating the uuid
  delete data.uuid;

  db.exec(sql, [data, db.bid(req.params.uuid)])
  .then(function () {
    return lookupSupplier(req.params.uuid);
  })
  .then(function (record) {

    Topic.publish(Topic.channels.INVENTORY, {
      event: Topic.events.UPDATE,
      entity: Topic.entities.SUPPLIER,
      user_id: req.session.user.id,
      uuid: req.params.uuid
    });

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
 * This method search for a supplier by their name.
 */
function search(req, res, next) {
  let limit = Number(req.query.limit);

  let sql = `
    SELECT BUID(supplier.uuid) as uuid, BUID(supplier.creditor_uuid) as creditor_uuid, supplier.name,
      supplier.address_1, supplier.address_2, supplier.email,
      supplier.fax, supplier.note, supplier.phone, supplier.international, supplier.locked
    FROM supplier
    WHERE supplier.name LIKE "%?%"
  `;

  if (limit) {
    sql += 'LIMIT ' + Math.floor(limit) + ';';
  }

  db.exec(sql, [req.query.name])
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
