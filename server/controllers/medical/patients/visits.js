
/**
 * @module medical/patients/visits
 *
 * @description
 * This controller is responsible for implementing patient visits, which allow medical data to accompany
 * a patient's visit to the hospital.
 *
 * It is responsible for reading and writing to the `patient_visit` database table as well as responding to HTTP
 * requests.
 *
 * @requires  lodash
 * @requires  q
 * @requires  lib/util
 * @requires  lib/db
 * @requires  lib/errors/BadRequest
 */

const _ = require('lodash');
const Q = require('q');
const { uuid } = require('../../../lib/util');
const db = require('../../../lib/db');
const BadRequest = require('../../../lib/errors/BadRequest');
const NotFound = require('../../../lib/errors/NotFound');
const FilterParser = require('../../../lib/filter');

exports.list = list;
exports.detail = detail;
exports.listByPatient = listByPatient;
exports.admission = admission;
exports.discharge = discharge;
exports.transfer = transfer;

const COLUMNS = `
  BUID(patient_visit.uuid) AS uuid, BUID(patient_visit.patient_uuid) as patient_uuid,
  patient_visit.start_date, patient_visit.start_notes, patient_visit.end_date, patient_visit.end_notes,
  patient_visit.user_id, user.username, patient_visit.start_diagnosis_id, patient_visit.end_diagnosis_id,
  DATEDIFF(IFNULL(patient_visit.end_date, CURRENT_DATE()), patient_visit.start_date) AS duration,
  ISNULL(patient_visit.end_date) AS is_open, icd10.label as start_diagnosis_label, icd10.code as start_diagnosis_code,
  patient_visit.hospitalized,
  b.label AS bed_label, r.label AS room_label, w.name AS ward_name,
  patient.display_name, patient.hospital_no, em.text AS patient_reference
`;

const REQUIRE_DIAGNOSES = false;

function find(options) {
  db.convert(options, ['uuid', 'patient_uuid']);
  const filters = new FilterParser(options);

  const sql = `
    SELECT ${COLUMNS}
    FROM patient_visit
    JOIN patient ON patient.uuid = patient_visit.patient_uuid
    JOIN entity_map em ON em.uuid = patient.uuid
    JOIN user ON patient_visit.user_id = user.id
    JOIN patient_hospitalization ph ON ph.patient_visit_uuid = patient_visit.uuid
      AND ph.created_at = (
        SELECT ph2.created_at FROM patient_hospitalization ph2 
        WHERE ph2.patient_visit_uuid = ph.patient_visit_uuid
        ORDER BY ph2.created_at DESC LIMIT 1
      )
    JOIN bed b ON b.id = ph.bed_id
    JOIN room r ON r.uuid = b.room_uuid
    JOIN ward w ON w.uuid = r.ward_uuid
    LEFT JOIN icd10 ON icd10.id = patient_visit.start_diagnosis_id
  `;

  filters.equals('uuid', 'uuid', 'patient_visit');
  filters.equals('patient_uuid', 'patient_uuid', 'patient_visit');
  filters.custom('is_open', 'ISNULL(patient_visit.end_date) = ?');
  filters.custom(
    'diagnosis_id',
    '(patient_visit.start_diagnosis_id = ? OR patient_visit.end_diagnosis_id = ?)',
    _.fill(Array(2), options.diagnosis_id)
  );

  filters.fullText('start_notes', 'start_notes', 'patient_visit');
  filters.fullText('end_notes', 'end_notes', 'patient_visit');

  filters.setOrder('ORDER BY patient_visit.start_date DESC');

  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();
  return db.exec(query, parameters);
}

/**
 * @method list
 *
 * @description
 * List all records of the patients visits in the database.  Takes in the following
 * optional parameters:
 *   1. limit {number}
 *   2. diagnosis {code}
 *
 * GET /patients/visits
 */
function list(req, res, next) {
  find(req.query)
    .then(rows => res.status(200).json(rows))
    .catch(next)
    .done();
}


/**
 * @method detail
 *
 * @description
 * Load details of a visit by its uuid
 *
 * GET /patients/visits/:uuid
 */
function detail(req, res, next) {
  const visitUuid = req.params.uuid;

  /**
   * return visit of patients by considering the last location (bed) of the
   * patient during a visit
   */
  const sql = `
    SELECT ${COLUMNS}
    FROM patient_visit
    JOIN patient ON patient.uuid = patient_visit.uuid
    JOIN user on patient_visit.user_id = user.id
    JOIN patient_hospitalization ph ON ph.patient_visit_uuid = patient_visit.uuid 
      AND ph.created_at = (
        SELECT ph2.created_at FROM patient_hospitalization ph2 
        WHERE ph2.patient_visit_uuid = ph.patient_visit_uuid
        ORDER BY ph2.created_at DESC LIMIT 1
      )
    JOIN bed b ON b.id = ph.bed_id
    JOIN room r ON r.uuid = b.room_uuid
    JOIN ward w ON w.uuid = r.ward_uuid
    LEFT JOIN icd10 ON icd10.id = patient_visit.start_diagnosis_id
    WHERE uuid = ?;
  `;

  // get the correct record
  db.one(sql, [db.bid(visitUuid)], visitUuid)
    .then(row => res.status(200).json(row))
    .catch(next)
    .done();
}

/**
 * @method listByPatient
 *
 * @description
 * List all records of the patients visit for a patient.  Takes in the following
 * optional parameters:
 *   1. limit {number}
 *   2. last {boolean}
 *   3. diagnosis {number}
 *
 * GET /patients/:uuid/visits
 */
function listByPatient(req, res, next) {
  const patientUuid = req.params.uuid;

  const options = req.query;
  options.patient_uuid = patientUuid;

  find(options)
    .then(visits => {
      res.status(200).json(visits);
    })
    .catch(next)
    .done();
}

/**
 * @method admission
 *
 * @description
 * The admission() route will create a new record in the patient_visit table.
 * The required data is:
 *  1. start_diagnosis_id
 *
 * POST /patients/:uuid/visits/admission
 */
function admission(req, res, next) {
  const data = req.body;

  const visitUuid = uuid();
  data.uuid = db.bid(visitUuid);
  data.patient_uuid = req.params.uuid;

  // add user id
  data.user_id = req.session.user.id;

  // if there is not start_diagnosis_id, return a BAD REQUEST that will insist
  // on a diagnosis.
  if (REQUIRE_DIAGNOSES && !data.start_diagnosis_id) {
    next(new BadRequest(
      'An admission diagnosis is required to begin a patient visit.',
      'PATIENT.VISITS.ERR_MISSING_DIAGNOSIS'
    ));

    return;
  }

  // set and parse the start_date if it is not defined
  data.start_date = new Date(data.start_date || new Date());

  // parse the patient_uuid as needed
  if (data.patient_uuid) {
    data.patient_uuid = db.bid(data.patient_uuid);
  }

  createHospitalization(data)
    .then(() => {
      res.status(201).json({ uuid : visitUuid });
    })
    .catch(next)
    .done();
}

function createHospitalization(data) {
  const { bed } = data;
  const visit = _.omit(data, 'bed');

  return Q.fcall(() => {
    return lookupAutoAvailableBed(bed);
  })
    .then(b => {
      const sqlInsertVisit = `
        INSERT INTO patient_visit SET ?;
      `;
      const sqlInsertHospitalization = `
        INSERT INTO patient_hospitalization SET ?
      `;
      const sqlUpdateBed = `
        UPDATE bed SET is_occupied = 1 WHERE id = ?;
      `;
      const paramInsertHospitalization = {
        uuid : db.bid(uuid()),
        patient_visit_uuid : visit.uuid,
        patient_uuid : visit.patient_uuid,
        room_uuid : db.bid(bed.room_uuid),
        bed_id : b.id,
      };
      const transaction = db.transaction();
      // insert a new patient visit
      transaction.addQuery(sqlInsertVisit, [visit]);
      // insert a new patient hospitalization
      transaction.addQuery(sqlInsertHospitalization, [paramInsertHospitalization]);
      // update the bed for the hopitalized patient
      transaction.addQuery(sqlUpdateBed, [paramInsertHospitalization.bed_id]);
      return transaction.execute();
    });

}

function lookupAutoAvailableBed(bedOptions) {
  const sql = `
    SELECT b.id FROM bed b 
    JOIN room r ON r.uuid = b.room_uuid
    WHERE r.uuid = ? AND b.is_occupied = 0
    ORDER BY r.label, b.label
    LIMIT 1;
  `;
  return bedOptions.id ? { id : bedOptions.id } : db.one(sql, [db.bid(bedOptions.room_uuid)]);
}

/**
 * @method transfer
 *
 * @description
 * The transfer() method will create a new record in the patient_hospitalization
 * table as a transfer.
 *
 * The required data is :
 *  1. patient_uuid
 *  2. patient_visit_uuid
 */
function transfer(req, res, next) {
  const patientUuid = db.bid(req.params.uuid);
  const patientVisitUuid = db.bid(req.params.patient_visit_uuid);
  const params = db.convert(req.body, ['room_uuid']);
  const glb = {};

  const lookupLastLocation = `
    SELECT ph.patient_uuid, ph.room_uuid, ph.bed_id
    FROM patient_hospitalization ph 
    JOIN patient_visit pv ON pv.uuid = ph.patient_visit_uuid
    WHERE pv.uuid = ? AND pv.patient_uuid = ?
    ORDER BY ph.created_at DESC
    LIMIT 1;
  `;
  const addNewLocation = `
    INSERT INTO patient_hospitalization SET ?
  `;
  const setOccupiedNewBed = `
    UPDATE bed SET is_occupied = 1 WHERE id = ?;
  `;
  const setFreeOldBed = `
    UPDATE bed SET is_occupied = 0 WHERE id = ?;
  `;
  db.one(lookupLastLocation, [patientVisitUuid, patientUuid])
    .then(previousBed => {
      glb.previousBed = previousBed;
      return lookupAutoAvailableBed(params);
    })
    .then(availableBed => {
      glb.newHospitalizationUuid = uuid();
      const paramInsertHospitalization = {
        uuid : db.bid(glb.newHospitalizationUuid),
        patient_visit_uuid : patientVisitUuid,
        patient_uuid : patientUuid,
        room_uuid : params.room_uuid,
        bed_id : availableBed.id,
      };
      const transaction = db.transaction();
      // insert a new patient location as hospitalization
      transaction.addQuery(addNewLocation, [paramInsertHospitalization]);
      // update the bed for the hopitalized patient
      transaction.addQuery(setOccupiedNewBed, [paramInsertHospitalization.bed_id]);
      // set free the old bed
      transaction.addQuery(setFreeOldBed, [glb.previousBed.bed_id]);
      return transaction.execute();
    })
    .then(() => {
      res.status(201).json({ uuid : glb.newHospitalizationUuid });
    })
    .catch(next)
    .done();
}

/**
 * @method discharge
 *
 * @description
 * The discharge() route will update a new record in the patient_visit table.
 * The required data is:
 *  1. end_diagnosis_id
 *  2. uuid (the visit uuid)
 *
 * POST /patients/:uuid/visits/discharge
 */
function discharge(req, res, next) {
  const data = req.body;
  const visitUuid = data.uuid;
  delete data.uuid;

  if (!visitUuid) {
    next(new NotFound(
      'You did not specify a visit identifier to end!  Please pass an identifier to the discharge() method.',
      'PATIENT.VISITS.ERR_MISSING_UUID'
    ));

    return;
  }

  // if there is not end_diagnosis_id, return a BAD REQUEST that will insist
  // on a diagnosis.
  if (REQUIRE_DIAGNOSES && !data.end_diagnosis_id) {
    next(new BadRequest(
      'A discharge diagnosis is required to end a patient visit.  Please select an ICD10 diagnosis code.',
      'PATIENT.VISITS.ERR_MISSING_DIAGNOSIS'
    ));

    return;
  }

  // set and parse the end_date if it is not defined
  data.end_date = new Date(data.end_date || new Date());

  const sql = `
    UPDATE patient_visit SET ? WHERE uuid = ?;
  `;
  const sqlSetFreeBed = `
    UPDATE bed b
    JOIN patient_hospitalization ph ON ph.bed_id = b.id
    JOIN patient_visit pv ON pv.uuid = ph.patient_visit_uuid
    SET b.is_occupied = 0 
    WHERE pv.uuid = ?;
  `;
  const transaction = db.transaction();
  transaction.addQuery(sql, [data, db.bid(visitUuid)]);
  transaction.addQuery(sqlSetFreeBed, [db.bid(visitUuid)]);
  transaction.execute()
    .then(() => {
      res.status(201).json({ uuid : visitUuid });
    })
    .catch(next)
    .done();
}
