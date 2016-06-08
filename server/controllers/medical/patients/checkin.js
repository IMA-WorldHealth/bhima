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
  * @requires  lib/db
  */
  'use strict'

  const db = require('../../../lib/db');

  exports.list = list;

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

  let listVisitsQuery =
    `
      SELECT
        BUID(patient_uuid) as patient_uuid, start_date, end_date, user_id, username
      FROM patient_visit 
      JOIN user on patient_visit.user_id = user.id
      WHERE patient_uuid = ?
      ORDER BY start_date ASC
    `;

  db.exec(listVisitsQuery, [db.bid(patientUuid)])
    .then(function (visits) {
      res.status(200).json(visits);
    })
    .catch(next)
    .done();
}
