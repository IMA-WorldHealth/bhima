/**
 * @module medical/patients/groups
 *
 * @description
 * This module is concerned with all group operations that require a patient
 * prefix.  These operations include finding a patient's groups, updating a
 * patient's group associations, and listing a patient's groups.
 *
 * @requires lodash
 * @requires lib/db
 * @requires lib/node-uuid
 * @requires lib/errors/BadRequest
 * @requires lib/errors/NotFound
 * @requires Topic
 */

const _ = require('lodash');
const db = require('../../../lib/db');
const uuid = require('node-uuid');
const BadRequest = require('../../../lib/errors/BadRequest');
const NotFound = require('../../../lib/errors/NotFound');
const Topic = require('../../../lib/topic');

// GET /patients/:uuid/groups
exports.list = list;

// POST /patients/:uuid/groups
exports.update = update;

/**
 * @method list
 *
 * @description
 * Given a patient, this will list the groups to which they are registered.
 */
function list(req, res, next) {
  const id = db.bid(req.params.uuid);

  // just check if the patient exists
  let patientExistenceQuery =
    'SELECT uuid FROM patient WHERE uuid = ?;';

  // read patient groups
  let patientGroupsQuery = `
    SELECT patient_group.name, patient_group.note, patient_group.created_at, BUID(patient_group.uuid) as uuid
    FROM assignation_patient LEFT JOIN patient_group ON patient_group_uuid = patient_group.uuid
    WHERE patient_uuid = ?;
  `;

  db.exec(patientExistenceQuery, [id])
    .then(function (rows) {
      if (_.isEmpty(rows)) {
        throw new NotFound(`Could not find an assignation patient with uuid ${req.params.uuid}.`);
      }

      return db.exec(patientGroupsQuery, [id]);
    })
    .then(function(patientGroups) {
      res.status(200).json(patientGroups);
    })
    .catch(next)
    .done();
}

/**
 * @method update
 *
 * @description
 * This endpoint accepts an array of patient group unique ids that will be
 * assigned to the patient id provided in the route.  If no ids are provided,
 * the route will simply remove all patient group assignments from the patient.
 */
function update(req, res, next) {
  const patientId = db.bid(req.params.uuid);

  // TODO make sure assignments is an array etc. - test for these cases
  if (!req.body.assignments) {
    return next(
      new BadRequest(
        `Request must specify an "assignments" object containing an array of patient group ids.`,
        'ERROR.ERR_MISSING_INFO'
      )
    );
  }

  // Clear assigned groups
  let removeAssignmentsQuery =
    'DELETE FROM assignation_patient WHERE patient_uuid = ?';

  // Insert new relationships
  let createAssignmentsQuery =
    'INSERT INTO assignation_patient (uuid, patient_uuid, patient_group_uuid) VALUES ?';

  // map each requested patient group uuid to the current patient uuid to be
  // inserted into the database
  let assignmentData = req.body.assignments.map(function (patientGroupId) {
    return [
      db.bid(uuid.v4()),
      patientId,
      db.bid(patientGroupId)
    ];
  });

  let transaction = db.transaction();

  transaction.addQuery(removeAssignmentsQuery, [patientId]);

  // Create query is not executed unless patient groups have been specified
  if (assignmentData.length) {
    transaction.addQuery(createAssignmentsQuery, [assignmentData]);
  }

  transaction.execute()
    .then(function (result) {

      Topic.publish(Topic.channels.MEDICAL, {
        event: Topic.events.UPDATE,
        entity: Topic.entities.PATIENT,
        user_id: req.session.user.id,
        uuid: req.params.uuid
      });

      // TODO send back correct ids
      res.status(200).json(result);
    })
    .catch(next)
    .done();
}
