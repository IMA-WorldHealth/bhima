'use strict';

/**
 * @overview CreditorGroups
 *
 * @description
 * This controller exposes an API to the client for reading and creditor_groups
 */
const db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');
const uuid = require('node-uuid');

// GET /creditor_groups
function lookupCreditorGroup(uuid) {

  const sql = `
    SELECT enterprise_id, BUID(uuid) as uuid, name, account_id, locked
    FROM creditor_group
    WHERE creditor_group.uuid = ?;
  `;

  return db.one(sql, [db.bid(uuid)], uuid, 'Creditor Group');
}


// Lists of Creditor Groups
function list(req, res, next) {
  let sql =
    'SELECT BUID(uuid) as uuid, name FROM creditor_group ;';

  if (req.query.detailed === '1') {
    sql =
      `SELECT enterprise_id, BUID(uuid) as uuid, name, account_id, locked
      FROM creditor_group ;`;
  }

  db.exec(sql)
    .then(function (rows) {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
* GET /creditor_groups/:uuid
*
* Returns the detail of a single Creditor Group
*/
function detail(req, res, next) {
  lookupCreditorGroup(req.params.uuid)
    .then(function (record) {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}


// POST /creditor_groups
function create(req, res, next) {
  const data = req.body;

  // provide UUID if the client has not specified
  data.uuid = db.bid(data.uuid || uuid.v4());

  const sql =
    'INSERT INTO creditor_group SET ? ';

  db.exec(sql, [data])
    .then(function (row) {
      res.status(201).json({ uuid : uuid.unparse(data.uuid) });
    })
    .catch(next)
    .done();
}


// PUT /creditor_groups/:uuid
function update(req, res, next) {
  let sql =
    'UPDATE creditor_group SET ? WHERE uuid = ?;';

  const uid = db.bid(req.params.uuid);

  db.exec(sql, [req.body, uid])
    .then(function () {
      return lookupCreditorGroup(req.params.uuid);
    })
    .then(function (record) {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// get list of creditor group
exports.list = list;

// get details of a creditor group
exports.detail = detail;

// create a new creditor group
exports.create = create;

// update creditor group informations
exports.update = update;
