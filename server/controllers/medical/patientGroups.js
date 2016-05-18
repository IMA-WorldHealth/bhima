/**
 * @module medical/patientGroups
 *
 * @description This controller is responsible for implementing all crud and others custom request
 * on the patient groups table through the `/patient_groups` endpoint.
 *
 * The /patient_groups HTTP API endpoint
 *
 * @requires lib/db
 * @requires node-uuid
 * @requires lib/errors/NotFound
 */

'use strict';

const db = require('../../lib/db');
const uuid = require('node-uuid');
const NotFound = require('../../lib/errors/NotFound');

/**
 * @method list()
 * Returns an array of patient groups.
 */
function list(req, res, next) {

  let sql = `
    SELECT BUID(pg.uuid) as uuid, pg.name, BUID(pg.price_list_uuid) AS price_list_uuid,
      pg.note, pg.created_at
    FROM patient_group AS pg
  `;

  if (req.query.detailed === '1') {
    sql = `
      SELECT BUID(pg.uuid) as uuid, pg.name, BUID(pg.price_list_uuid) AS price_list_uuid,
        pg.note, pg.created_at, pl.label AS priceListLable, pl.description
      FROM patient_group AS pg LEFT JOIN price_list AS pl ON pg.price_list_uuid = pl.uuid
    `;
  }

  sql += ' ORDER BY pg.name;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
 * Create a patient group in the database
 */
function create(req, res, next) {
  let record = db.convert(req.body, ['price_list_uuid']);
  let sql = 'INSERT INTO patient_group SET ?';

  // provide UUID if the client has not specified
  record.uuid = db.bid(record.uuid || uuid.v4());

  db.exec(sql, [ record ])
  .then(function (result) {
    res.status(201).json({ uuid: uuid.unparse(record.uuid) });
  })
  .catch(next)
  .done();
}

/**
 * Update a patient group in the database
 */
function update(req, res, next) {

  var uid = db.bid(req.params.uuid);
  var sql = 'UPDATE patient_group SET ? WHERE uuid = ?';

  var data = db.convert(req.body, ['price_list_uuid']);

  if (data.created_at) {
    data.created_at = new Date(data.created_at);
  }

  // make sure we aren't updating the uuid
  delete data.uuid;

  db.exec(sql, [data, uid])
  .then(function (rows) {
    if (!rows.affectedRows) {
      throw new NotFound('No patient group found with id ' + uuid.unparse(uid));
    }

    return lookupPatientGroup(uid);
  })
  .then(function (group) {
    res.status(200).json(group);
  })
  .catch(next)
  .done();
}

/**
 * Remove a patient group in the database
 */
function remove(req, res, next) {
  const id = db.bid(req.params.uuid);
  let sql = 'DELETE FROM patient_group WHERE uuid = ?';

  db.exec(sql, [ id ])
  .then(function (rows) {
    if (!rows.affectedRows) {
      throw new NotFound(`No patient group found with uuid ${req.params.uuid}`);
    }
    res.sendStatus(204);
  })
  .catch(next)
  .done();
}

/**
 * Return a patient group details from the database
 */
function detail(req, res, next) {
  lookupPatientGroup(db.bid(req.params.uuid))
  .then(function (row) {
    res.status(200).json(row);
  })
  .catch(next)
  .done();
}

/**
 * Return a patient group instance from the database
 *
 * @param {String} uid the uuid of the patinet group
 */
function lookupPatientGroup(uid) {
  var sql =
    `SELECT BUID(pg.uuid) as uuid, pg.name, pg.enterprise_id, BUID(pg.price_list_uuid) as price_list_uuid, pg.note, pg.created_at
    FROM patient_group AS pg WHERE pg.uuid = ?`;

  return db.exec(sql, [uid])
  .then(function (rows) {
    if (!rows.length) {
      throw new NotFound('No patient group found with id ' + uuid.unparse(uid));
    }
    return rows[0];
  });
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;
