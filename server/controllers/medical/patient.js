/**
* The /patient HTTP API endpoint
*
* @module medical/patient
*
* @desc This module is responsible for handling all crud operations relatives to patients
* and define all patient api functions
*
* @required lib/db
* @required lib/guid
*
* @todo Review naming conventions
* @todo Remove or refactor methods to fit new API standards
*
*/

'use strict';

var db = require('../../lib/db'),
    uuid = require('../../lib/guid');

// create a new patient
exports.create = create;

// get details of a patient
exports.details = detail;

// update patient informations
exports.update = update;

// get list of patients
exports.list = list;

// search patients
exports.search = search;

// get the patient group
exports.groups = groups;

// update patient group
exports.updateGroups = updateGroups;

// get list of groups
exports.listGroups = listGroups;

// verify the hospital number of a patient
exports.verifyHospitalNumber = verifyHospitalNumber;

// Search patient reference
exports.searchReference = searchReference;

// Search fuzzy
exports.searchFuzzy = searchFuzzy;

// log patient visit
exports.visit = visit;


/** @todo Method handles too many operations */
function create(req, res, next) {
  var writeDebtorQuery, calculateReferenceQuery, writePatientQuery;
  var invalidParameters;
  var patientText;

  var transaction;

  var createRequestData = req.body;

  var medical = createRequestData.medical;
  var finance = createRequestData.finance;


  // Debtor group required for financial modelling
  invalidParameters = !finance || !medical;

  if (invalidParameters) {

    // FIXME This should be handled by middleware
    res.status(400).json({
      code : 'ERROR.ERR_MISSING_INFO',
      reason : 'Both `financial` and `medical` information must be provided to register a patient.'
    });
    return;
  }

  // pre-process dates
  if (medical.dob) {
    medical.dob = new Date(medical.dob);
  }
  if (medical.registration_date) {
    medical.registration_date = new Date(medical.registration_date);
  }

  // Optionally allow client to specify UUID
  finance.uuid = finance.uuid || uuid();
  medical.uuid = medical.uuid || uuid();
  medical.debitor_uuid = finance.uuid;

  writeDebtorQuery = 'INSERT INTO debitor (uuid, group_uuid, text) VALUES ' +
    '(?, ?, ?)';

  writePatientQuery = 'INSERT INTO patient SET ?';

  transaction = db.transaction();

  transaction
    .addQuery(writeDebtorQuery, [finance.uuid, finance.debitor_group_uuid, generatePatientText(medical)])
    .addQuery(writePatientQuery, [medical]);

  transaction.execute()
    .then(function (results) {
      var createConfirmation = {};

      // All querys returned OK
      // Attach patient UUID to be used for confirmation etc.
      createConfirmation.uuid = medical.uuid;
      createConfirmation.results = results;

      res.status(201).json(createConfirmation);
      return;
    })
    .catch(next)
    .done();
}

function generatePatientText(patient) {
  var textLineDefault = 'Patient/';
  return textLineDefault.concat(patient.last_name, '/', patient.middle_name);
}

/** @todo review if this many details should be returned under a patient end point */
function detail(req, res, next) {
  var uuid = req.params.uuid;

  handleFetchPatient(uuid)
    .then(function(result) {
      var patientDetail;

      if (isEmpty(result)) {
        res.status(404).json({
          code : 'ERR_NOT_FOUND',
          reason : 'No patient found under the id ' + uuid
        });
        return;
      } else {

        // UUID has matched patient - extract result and send to client
        patientDetail = result[0];
        res.status(200).json(patientDetail);
      }
    })
    .catch(next)
    .done();
}

function update(req, res, next) {
  var updatePatientQuery;
  var queryData = req.body;
  var patientId = req.params.uuid;

  if (queryData.dob) {
    queryData.dob = new Date(queryData.dob);
  }
  if (queryData.registration_date) {
    queryData.registration_date = new Date(queryData.registration_date);
  }

  updatePatientQuery =
    'UPDATE patient SET ? WHERE uuid = ?';

  db.exec(updatePatientQuery, [queryData, patientId])
    .then(function (result) {

      return handleFetchPatient(patientId);
    })
    .then(function (updatedPatientResults) {
      var updatedPatient = updatedPatientResults[0];

      res.status(200).json(updatedPatient);
    })
    .catch(next)
    .done();
}

function handleFetchPatient(uuid) {
  var patientDetailQuery =
    'SELECT p.uuid, p.project_id, p.debitor_uuid, p.first_name, p.last_name, p.middle_name, p.hospital_no, ' +
      'p.sex, p.registration_date, p.email, p.phone, p.dob, p.origin_location_id, p.reference, p.title, p.address_1, p.address_2, p.father_name, p.mother_name, p.religion, p.marital_status, p.profession, p.employer, p.spouse, p.spouse_profession, ' +
      'p.spouse_employer, p.notes, proj.abbr, d.text, ' +
      'dg.account_id, dg.price_list_uuid, dg.is_convention, dg.uuid as debitor_group_uuid, dg.locked, dg.name as debitor_group_name ' +
    'FROM patient AS p JOIN project AS proj JOIN debitor AS d JOIN debitor_group AS dg ' +
    'ON p.debitor_uuid = d.uuid AND d.group_uuid = dg.uuid AND p.project_id = proj.id ' +
    'WHERE p.uuid = ?';

  return db.exec(patientDetailQuery, [uuid]);
}

function groups(req, res, next) {
  var patientGroupsQuery;
  var patientExistenceQuery;
  var uuid = req.params.uuid;

  // just check if the patient exists
  patientExistenceQuery =
    'SELECT uuid FROM patient WHERE uuid = ?;';

  // read patient groups
  patientGroupsQuery =
    'SELECT patient_group.name, patient_group.note, patient_group.created, patient_group.uuid ' +
    'FROM assignation_patient LEFT JOIN patient_group ON patient_group_uuid = patient_group.uuid ' +
    'WHERE patient_uuid = ?';

  db.exec(patientExistenceQuery, [uuid])
    .then(function (rows) {

      if (isEmpty(rows)) {
        throw new req.codes.ERR_NOT_FOUND();
      }

      return db.exec(patientGroupsQuery, [uuid]);
    })
    .then(function(patientGroups) {
      res.status(200).json(patientGroups);
    })
    .catch(next)
    .done();
}

function listGroups(req, res, next) {
  var listGroupsQuery;

  listGroupsQuery =
    'SELECT uuid, name, note, created, price_list_uuid ' +
    'FROM patient_group';

  db.exec(listGroupsQuery)
    .then(function(allPatientGroups) {

      res.status(200).json(allPatientGroups);
    })
    .catch(next)
    .done();
}

// Accepts an array of patient group UUIDs that will be assigned to the
// patient provided in the route
function updateGroups(req, res, next) {
  var removeAssignmentsQuery;
  var createAssignmentsQuery;
  var assignmentData;
  var transaction;

  // If UUID is not passed this route will not match - invalid uuids in this case
  // will be responded to with a bad request (mysql)
  var patientId = req.params.uuid;

  // TODO make sure assignments is an array etc. - test for these cases
  if (!req.body.assignments) {
    return res.status(400)
    .json({
      code : 'ERROR.ERR_MISSING_INFO',
      reason: 'Request must specify an `assignment` object containing an array of patient group ids'
    });
  }

  // Clear assigned groups
  removeAssignmentsQuery =
    'DELETE FROM assignation_patient ' +
    'WHERE patient_uuid = ?';

  // Insert new relationships
  createAssignmentsQuery =
    'INSERT INTO assignation_patient (uuid, patient_uuid, patient_group_uuid) VALUES ?';

  // Map each requested patient group uuid to the current patient ID to be
  // inserted into the database
  assignmentData = req.body.assignments.map(function (patientGroupId) {
    return [
      uuid(),
      patientId,
      patientGroupId
    ];
  });

  transaction = db.transaction();

  transaction.addQuery(removeAssignmentsQuery, [patientId]);

  // Create query is not executed unless patient groups have been specified
  if (assignmentData.length) {
    transaction.addQuery(createAssignmentsQuery, [assignmentData]);
  }

  transaction.execute()
    .then(function (result) {

      // TODO send back correct ids
      res.status(200).json(result);
    })
    .catch(next)
    .done();
}

function list(req, res, next) {
  var listPatientsQuery;

  listPatientsQuery =
    'SELECT p.uuid, CONCAT(pr.abbr, p.reference) AS patientRef, p.first_name, ' +
      'p.middle_name, p.last_name ' +
    'FROM patient AS p JOIN project AS pr ON p.project_id = pr.id';

  db.exec(listPatientsQuery)
  .then(function (result) {
    var patients = result;

    res.status(200).json(patients);
  })
  .catch(next)
  .done();
}

/**
 * @description Return a status object indicating if the hospital number has laready been registered
 * with an existing patient
 *
 * Returns status object
 * {
 *  registered : Boolean - Specifies if the id passed has already been registered or not
 *  details : Object (optional) - Includes the details of the registered hospital number
 *  }
 */
function verifyHospitalNumber(req, res, next) {
  var verifyQuery;
  var hospitalNumber = req.params.id;

  verifyQuery =
    'SELECT uuid, hospital_no FROM patient ' +
      'WHERE hospital_no = ?';

  db.exec(verifyQuery, [hospitalNumber])
    .then(function (result) {
      var hospitalIdStatus = {};

      if (isEmpty(result)) {

        hospitalIdStatus.registered = false;
      } else {

        hospitalIdStatus.registered = true;
        hospitalIdStatus.details = result[0];
      }

      res.status(200).json(hospitalIdStatus);
    })
    .catch(next)
    .done();
}

 /**
 * GET /patient/search/reference/:reference
 * @desc Performs a search on the patient reference (e.g. HBB123)
 */
function searchReference (req, res, next) {

  var sql, reference = req.params.reference;

  // use MYSQL to look up the reference
  // TODO This could probably be optimized
  sql =
    'SELECT q.uuid, q.project_id, q.debitor_uuid, q.first_name, q.last_name, q.middle_name, ' +
      'q.sex, q.dob, q.origin_location_id, q.reference, q.text, ' +
      'q.account_id, q.price_list_uuid, q.is_convention, q.locked ' +
    'FROM (' +
      'SELECT p.uuid, p.project_id, p.debitor_uuid, p.first_name, p.last_name, p.middle_name, ' +
      'p.sex, p.dob, CONCAT(proj.abbr, p.reference) AS reference, p.origin_location_id, d.text, ' +
      'dg.account_id, dg.price_list_uuid, dg.is_convention, dg.locked ' +
      'FROM patient AS p JOIN project AS proj JOIN debitor AS d JOIN debitor_group AS dg ' +
        'ON p.debitor_uuid = d.uuid AND d.group_uuid = dg.uuid AND p.project_id = proj.id' +
    ') AS q ' +
    'WHERE q.reference = ?;';

  db.exec(sql, [reference])
  .then(function (rows) {

    if (isEmpty(rows)) {
      res.status(404).send();
    } else {
      res.status(200).json(rows[0]);
    }

  })
  .catch(next)
  .done();

}

/**
* GET /patient/search/fuzzy/:match
* @desc Performs fuzzy searching on patient names
*/
function searchFuzzy (req, res, next) {

  var sql, match = req.params.match;

  if (!match) { next(new Error('No parameter provided!')); }

  // search on the match parameter
  sql =
    'SELECT p.uuid, p.project_id, p.debitor_uuid, p.first_name, p.last_name,  p.middle_name, ' +
      'p.sex, p.dob, p.origin_location_id, p.reference, proj.abbr, d.text, ' +
      'dg.account_id, dg.price_list_uuid, dg.is_convention, dg.locked ' +
    'FROM patient AS p JOIN project AS proj JOIN debitor AS d JOIN debitor_group AS dg ' +
    'ON p.debitor_uuid = d.uuid AND d.group_uuid = dg.uuid AND p.project_id = proj.id ' +
    'WHERE ' +
      'LEFT(LOWER(CONCAT(p.last_name, \' \', p.middle_name, \' \', p.first_name )), CHAR_LENGTH(?)) = ? OR ' +
      'LEFT(LOWER(CONCAT(p.last_name, \' \', p.first_name, \' \', p.middle_name)), CHAR_LENGTH(?)) = ? OR ' +
      'LEFT(LOWER(CONCAT(p.first_name, \' \', p.middle_name, \' \', p.last_name)), CHAR_LENGTH(?)) = ? OR ' +
      'LEFT(LOWER(CONCAT(p.first_name, \' \', p.last_name, \' \', p.middle_name)), CHAR_LENGTH(?)) = ? OR ' +
      'LEFT(LOWER(CONCAT(p.middle_name, \' \', p.last_name, \' \', p.first_name)), CHAR_LENGTH(?)) = ? OR ' +
      'LEFT(LOWER(CONCAT(p.middle_name, \' \', p.first_name, \' \', p.last_name)), CHAR_LENGTH(?)) = ? ' +
    'LIMIT 10;';

  // man. That's a lot of matches
  db.exec(sql, [match, match, match, match, match, match, match, match, match, match, match, match])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

function visit (req, res, next) {
  var visitData = req.body;

  logVisit(visitData, req.session.user.id)
    .then(function (result) {

      // Assign patient ID as confirmation
      result.uuid = visitData.uuid;

      res.status(200).send(result);
    })
    .catch(next)
    .done();
}

function logVisit(patientData, userId) {
  var sql;
  var visitId = uuid();

  sql =
    'INSERT INTO `patient_visit` (`uuid`, `patient_uuid`, `registered_by`) VALUES (?, ?, ?)';

  return db.exec(sql, [visitId, patientData.uuid, userId]);
}

function isEmpty(array) {
  return array.length === 0;
}

/**
* GET /patient/search?name={string}&detail={boolean}&limit={number}
* GET /patient/search?reference={string}&detail={boolean}&limit={number}
* GET /patient/search?fields={object}
*
* @desc This function is responsible to find a patient with detailled informations or not
* and with a limited rows or not
*/
function search (req, res, next) {

  var sql,
      data       = [],
      qReference = req.query.reference,
      qName      = req.query.name,
      qFields    = req.query.fields,
      qDetail    = req.query.detail || 0,
      qLimit     = req.query.limit;

  try {
    var missingRequiredParameters = (!qReference && !qName && !qFields);
    if (missingRequiredParameters) { throw new req.codes.ERR_PARAMETERS_REQUIRED(); }

    qFields = qFields ? JSON.parse(qFields) : null;
    qDetail = Number(qDetail);
    qLimit  = Number(qLimit);

  } catch (err) {
    // notify the occurence of the error
    return next(err);
  }

  var columns =
      'q.uuid, q.project_id, q.reference, q.debitor_uuid, ' +
      'q.first_name, q.last_name, q.middle_name, q.sex, q.dob, q.registration_date ';

  // customize returned columns according detailled results or not
  if (qDetail) {
    columns +=
      ', q.abbr, q.creditor_uuid, q.father_name, q.mother_name, q.profession, q.employer, ' +
      'q.spouse, q.spouse_profession, q.spouse_employer, q.religion, q.marital_status, ' +
      'q.phone, q.email, q.address_1, q.address_2, q.renewal, q.origin_location_id, ' +
      'q.current_location_id, q.registration_date, q.title, q.notes, q.hospital_no, ' +
      'q.text, q.account_id, q.price_list_uuid, q.is_convention, q.locked ';
  }

  // build the main part of the sql query
  sql = 'SELECT ' + columns + ' FROM ' +
        '(' +
          'SELECT p.uuid, p.project_id, CONCAT(proj.abbr, p.reference) AS reference, p.debitor_uuid, p.creditor_uuid, ' +
            'p.first_name, p.last_name, p.middle_name, p.sex, p.dob, p.father_name, p.mother_name, ' +
            'p.profession, p.employer, p.spouse, p.spouse_profession, p.spouse_employer, ' +
            'p.religion, p.marital_status, p.phone, p.email, p.address_1, p.address_2, ' +
            'p.renewal, p.origin_location_id, p.current_location_id, p.registration_date, ' +
            'p.title, p.notes, p.hospital_no, d.text, proj.abbr, ' +
            'dg.account_id, dg.price_list_uuid, dg.is_convention, dg.locked ' +
          'FROM patient AS p JOIN project AS proj JOIN debitor AS d JOIN debitor_group AS dg ' +
            'ON p.debitor_uuid = d.uuid AND d.group_uuid = dg.uuid AND p.project_id = proj.id' +
        ') AS q ';

  // complete the sql query according parameters of search
  // such as by: name, reference or by a set of criteria
  if (qName && !qReference) {
    // Final sql query for finding patient by names : first_name, middle_name or last_name
    sql +=
        'WHERE ' +
        'LEFT(LOWER(CONCAT(q.last_name, \' \', q.middle_name, \' \', q.first_name )), CHAR_LENGTH(?)) = ? OR ' +
        'LEFT(LOWER(CONCAT(q.last_name, \' \', q.first_name, \' \', q.middle_name)), CHAR_LENGTH(?)) = ? OR ' +
        'LEFT(LOWER(CONCAT(q.first_name, \' \', q.middle_name, \' \', q.last_name)), CHAR_LENGTH(?)) = ? OR ' +
        'LEFT(LOWER(CONCAT(q.first_name, \' \', q.last_name, \' \', q.middle_name)), CHAR_LENGTH(?)) = ? OR ' +
        'LEFT(LOWER(CONCAT(q.middle_name, \' \', q.last_name, \' \', q.first_name)), CHAR_LENGTH(?)) = ? OR ' +
        'LEFT(LOWER(CONCAT(q.middle_name, \' \', q.first_name, \' \', q.last_name)), CHAR_LENGTH(?)) = ? ';

    data = [qName, qName, qName, qName, qName, qName, qName, qName, qName, qName, qName, qName];

  } else if (qFields && !qReference) {
    // Final sql query for finding patients by a set of criteria
    // defined in an object. Ex. : { sex: "M", last_name: "Doe" }
    data = [];

    // building the where clause criteria
    var criteria = Object.keys(qFields).map(function (item) {
      data.push(qFields[item]);
      return 'q.' + item + ' = ?';
    }).join(' AND ');

    sql += 'WHERE ' + criteria;

  } else if (qReference) {
    // Final sql query for finding patient identified by a reference. Ex. HBB123
    sql += 'WHERE q.reference = ? ';
    data = [qReference];

  } else {
    // throw an error in other cases
    return next(new req.codes.ERR_PARAMETERS_REQUIRED());
  }

  if (qLimit && typeof(qLimit) === 'number') {
    sql += ' LIMIT ' + Math.floor(qLimit) + ';';
  }

  db.exec(sql, data)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}
