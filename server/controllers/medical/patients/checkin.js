/**
 * @module medical/patients/checkin
 *
 * @description
 * This controller is responsible for the Patient Check In feature, this allows a hospital to track when returning
 * patients visit the hospital.
 *
 * It is responsible for reading and writing to the `patient_visit` database table as well as responding to HTTP
 * requests.
 *
 * @requires  node-uuid
 * @requires  lib/db
 * @requires  lib/topic
 * @requires  lib/errors/BadRequest
 */
'use strict';

const uuid  = require('node-uuid');

const db    = require('../../../lib/db');
const topic = require('../../../lib/topic');

const BadRequest = require('../../../lib/errors/BadRequest');

exports.list = list;
exports.create = create;

/**
 * @method list
 *
 * @description
 * List all records of the patients visit given a specified identifier.
 *
 * GET /patients/:uuid/visits
 */
function list(req, res, next) {
  const patientUuid = req.params.uuid;
  let limitQuery = '';

  if (req.query.limit) {
    const limit = Number(req.query.limit);

    // validate query string is valid - do not template in anything sent from the client
    if (isNaN(limit)) {
      throw new BadRequest('limit query must be a valid number');
    }
    limitQuery = `LIMIT ${limit}`;
  }

  let listVisitsQuery =
    `
      SELECT
        BUID(patient_uuid) as patient_uuid, start_date, end_date, user_id, username
      FROM patient_visit
      JOIN user on patient_visit.user_id = user.id
      WHERE patient_uuid = ?
      ORDER BY start_date DESC
      ${limitQuery}
    `;

  db.exec(listVisitsQuery, [db.bid(patientUuid)])
    .then(function (visits) {
      res.status(200).json(visits);
    })
    .catch(next)
    .done();
}

/**
 * @method checkin
 *
 * @description
 * Write a record into the patient_visit table checking a patient into a visit.
 *
 * POST /patients/:uuid/checkin
 */
function create(req, res, next) {
  const patientUuid = req.params.uuid;

  let checkinQuery =
    `
      INSERT INTO patient_visit
        (uuid, patient_uuid, start_date, user_id)
      VALUES
        (?, ?, CURRENT_TIMESTAMP, ?)
    `;

  db.exec(checkinQuery, [db.bid(uuid.v4()), db.bid(patientUuid), req.session.user.id])
    .then(function (checkin) {
      res.status(201).json({
        uuid : patientUuid
      });

      // public patient change (checkin) event
      topic.publish(topic.channels.MEDICAL, {
        event: topic.events.UPDATE,
        entity: topic.entities.PATIENT,
        user_id: req.session.user.id,
        uuid: patientUuid
      });
    })
    .catch(next)
    .done();
}
