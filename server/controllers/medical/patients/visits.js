
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
 * @requires  node-uuid
 * @requires  lib/db
 * @requires  lib/topic
 * @requires  lib/errors/BadRequest
 */

const uuid = require('node-uuid');
const db = require('../../../lib/db');
const topic = require('../../../lib/topic');
const BadRequest = require('../../../lib/errors/BadRequest');
const NotFound = require('../../../lib/errors/NotFound');

exports.list = list;
exports.detail = detail;
exports.listByPatient = listByPatient;
exports.admission = admission;
exports.discharge = discharge;

const COLUMNS = `
  BUID(uuid) AS uuid, BUID(patient_uuid) as patient_uuid, start_date, start_notes,
  end_date, end_notes, user_id, user.username, start_diagnosis_id, end_diagnosis_id,
  ISNULL(end_date) AS is_open, icd10.label as start_diagnosis_label, icd10.code as start_diagnosis_code
`;

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
  const limit = Number(req.query.limit);

  // @todo - refactor this SQL
  let limitQuery = '';
  const params = [];
  const where = [];

  // if the limit is properly defined set it.
  if (!isNaN(limit)) {
    limitQuery = `LIMIT ${limit}`;
  }

  if (req.query.is_open) {
    params.push(req.query.is_open);
    where.push('ISNULL(end_date) = ?');
  }

  if (req.query.diagnosis_id) {
    where.push('(start_diagnosis_id = ? OR end_diagnosis_id = ?)');
    params.push(req.query.diagnosis_id);
    params.push(req.query.diagnosis_id);
  }

  // if there is no where query, default to WHERE 1
  const whereQuery = where.length === 0 ? '1' : where.join(' AND ');

  const sql = `
    SELECT ${COLUMNS}
    FROM patient_visit
    JOIN user on patient_visit.user_id = user.id
    LEFT JOIN icd10 ON icd10.id = patient_visit.start_diagnosis_id
    WHERE ${whereQuery}
    ORDER BY start_date DESC
    ${limitQuery}
  `;

  db.exec(sql, params)
    .then(rows => res.status(200).json(rows))
    .catch(next)
    .done();
}


/**
 * @method detail
 *
 * @description
 * Load a patient visit by uuid.
 *
 * GET /patients/:patientUuid/visits/:uuid
 */
function detail(req, res, next) {
  const visitUuid = req.params.uuid;

  const sql = `
    SELECT ${COLUMNS}
    FROM patient_visit
    JOIN user on patient_visit.user_id = user.id
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
  let limitQuery = '';
  let diagnosisQuery = '';

  const limit = Number(req.query.limit);

  // if the limit is properly defined set it.
  if (!isNaN(limit)) {
    limitQuery = `LIMIT ${limit}`;
  }

  // if the 'last' option is set, get the last
  if (req.query.last) {
    limitQuery = `LIMIT 1;`;
  }

  //  if a diagnosis id is passed in, it should filter on diagnosis
  if (req.query.diagnosis_id) {
    diagnosisQuery = ' AND (start_diagnosis_id = ? OR end_diagnosis_id = ?) ';
  }

  const listVisitsQuery = `
    SELECT ${COLUMNS}
    FROM patient_visit
    JOIN user on patient_visit.user_id = user.id
    LEFT JOIN icd10 on patient_visit.start_diagnosis_id = icd10.id
    WHERE patient_uuid = ?
    ${diagnosisQuery}
    ORDER BY start_date DESC
    ${limitQuery}
  `;

  db.exec(listVisitsQuery, [db.bid(patientUuid), req.query.diagnosis_id, req.query.diagnosis_id])
    .then(visits => {
      // if the 'last' option is set, unwrap the returned value
      if (req.query.last) {
        const lastVisit = visits[0];
        res.status(200).json(lastVisit || {});
        return;
      }

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

  const visitUuid = uuid.v4();
  data.uuid = db.bid(visitUuid);
  data.patient_uuid = req.params.uuid;

  // add user id
  data.user_id = req.session.user.id;

  // if there is not start_diagnosis_id, return a BAD REQUEST that will insist
  // on a diagnosis.
  if (!data.start_diagnosis_id) {
    next(
      new BadRequest(
        'An admission diagnosis is required to begin a patient visit.',
        'PATIENT.VISITS.ERR_MISSING_DIAGNOSIS'
      )
    );

    return;
  }

  // set and parse the start_date if it is not defined
  data.start_date = new Date(data.start_date || new Date());

  // parse the patient_uuid as needed
  if (data.patient_uuid) {
    data.patient_uuid = db.bid(data.patient_uuid);
  }

  const sql = `
    INSERT INTO patient_visit SET ?;
  `;

  db.exec(sql, [data])
    .then(() => {
      res.status(201).json({ uuid : visitUuid });
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
    next(
      new NotFound(
        'You did not specify a visit identifier to end!  Please pass an identifier to the discharge() method.',
        'PATIENT.VISITS.ERR_MISSING_UUID'
      )
    );

    return;
  }

  // if there is not end_diagnosis_id, return a BAD REQUEST that will insist
  // on a diagnosis.
  if (!data.end_diagnosis_id) {
    next(
      new BadRequest(
        'A discharge diagnosis is required to end a patient visit.  Please select an ICD10 diagnosis code.',
        'PATIENT.VISITS.ERR_MISSING_DIAGNOSIS'
      )
    );

    return;
  }

  // set and parse the end_date if it is not defined
  data.end_date = new Date(data.end_date || new Date());

  const sql = `
    UPDATE patient_visit SET ? WHERE uuid = ?;
  `;

  db.exec(sql, [data, db.bid(visitUuid)])
    .then(() => {
      res.status(201).json({ uuid : visitUuid });
    })
    .catch(next)
    .done();
}
