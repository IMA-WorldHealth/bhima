/**
 * @module patientGroups
 *
 * @description
 * This controller is responsible for implementing all crud and others custom
 * requests on the patient groups table through the `/patients/groups` endpoint.
 *
 * The /patient_groups HTTP API endpoint
 *
 * @requires db
 * @requires node-uuid
 * @requires NotFound
 * @requires Topic
 */


const db = require('../../lib/db');
const uuid = require('node-uuid');
const NotFound = require('../../lib/errors/NotFound');
const Topic = require('../../lib/topic');

/**
 * @method list
 *
 * @description
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
  .then(rows => {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
 * @method create
 *
 * @description
 * Create a patient group in the database
 */
function create(req, res, next) {
  const record = db.convert(req.body, ['price_list_uuid']);
  const sql = 'INSERT INTO patient_group SET ?';

  // provide UUID if the client has not specified
  const uid = record.uuid || uuid.v4();
  record.uuid = db.bid(uid);

  db.exec(sql, [record])
  .then(() => {
    Topic.publish(Topic.channels.MEDICAL, {
      event : Topic.events.CREATE,
      entity : Topic.entities.PATIENT_GROUP,
      user_id : req.session.user.id,
      uuid : uid,
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
 * Update a patient group in the database
 */
function update(req, res, next) {
  const sql = 'UPDATE patient_group SET ? WHERE uuid = ?';

  const data = db.convert(req.body, ['price_list_uuid']);

  if (data.created_at) {
    data.created_at = new Date(data.created_at);
  }

  // make sure we aren't updating the uuid
  delete data.uuid;

  db.exec(sql, [data, db.bid(req.params.uuid)])
  .then(rows => {
    if (!rows.affectedRows) {
      throw new NotFound(`No patient group found with id ${req.params.uuid}`);
    }

    return lookupPatientGroup(req.params.uuid);
  })
  .then(group => {
    Topic.publish(Topic.channels.MEDICAL, {
      event : Topic.events.UPDATE,
      entity : Topic.entities.PATIENT_GROUP,
      user_id : req.session.user.id,
      uuid : req.params.uuid,
    });

    res.status(200).json(group);
  })
  .catch(next)
  .done();
}

/**
 * @method remove
 *
 * @description
 * Remove a patient group in the database
 */
function remove(req, res, next) {
  const id = db.bid(req.params.uuid);
  const sql = 'DELETE FROM patient_group WHERE uuid = ?';

  db.exec(sql, [id])
  .then(rows => {
    if (!rows.affectedRows) {
      throw new NotFound(`No patient group found with uuid ${req.params.uuid}`);
    }
    res.sendStatus(204);
  })
  .catch(next)
  .done();
}

/**
 * @method detail
 *
 * @description
 * Return a patient group details from the database
 */
function detail(req, res, next) {
  lookupPatientGroup(req.params.uuid)
    .then(row => {
      res.status(200).json(row);
    })
    .catch(next)
    .done();
}

/**
 * @method lookupPatientGroup
 *
 * @description
 * Return a patient group instance from the database
 *
 * @param {String} uid - the uuid of the patient group
 * @returns {Promise} - the result of the database query database
 */
function lookupPatientGroup(uid) {
  const sql = `
    SELECT BUID(pg.uuid) as uuid, pg.name, pg.enterprise_id,
      BUID(pg.price_list_uuid) as price_list_uuid, pg.note, pg.created_at
    FROM patient_group AS pg WHERE pg.uuid = ?;
  `;

  return db.one(sql, [db.bid(uid)], uid, 'patient group');
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;
