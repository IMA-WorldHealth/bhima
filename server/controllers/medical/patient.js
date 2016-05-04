/**
* The /patient HTTP API endpoint
*
* @module medical/patient
*
* @desc This module is responsible for handling all crud operations relatives to patients
* and define all patient api functions
*
* @requires lib/db
* @requires lib/node-uuid
*
* @todo Review naming conventions
* @todo Remove or refactor methods to fit new API standards
*/

'use strict';

const db = require('../../lib/db');
const uuid = require('node-uuid');
const BadRequest  = require('../../lib/errors/BadRequest');
const NotFound = require('../../lib/errors/NotFound');

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

// check if a hospital file number is assigned to any patients
exports.hospitalNumberExists = hospitalNumberExists;

// Search patient reference
exports.searchReference = searchReference;

// Search fuzzy
exports.searchFuzzy = searchFuzzy;

// log patient visit
exports.visit = visit;

/** @todo discuss if these should be handled by the entity APIs or by patients. */
exports.billingServices = billingServices;
exports.priceLists = priceLists;
exports.subsidies = subsidies;

/**
 * Converts dates and uuids to objects to enter into the database
 */
function convert(data) {
  if (data.current_location_id) {
    data.current_location_id = db.bid(data.current_location_id);
  }

  if (data.origin_location_id) {
    data.origin_location_id = db.bid(data.origin_location_id);
  }

  if (data.debtor_uuid) {
    data.debtor_uuid = db.bid(data.debtor_uuid);
  }

  if (data.debtor_group_uuid) {
    data.debtor_group_uuid = db.bid(data.debtor_group_uuid);
  }

  if (data.dob) {
    data.dob = new Date(data.dob);
  }

  if (data.registration_date) {
    data.registration_date = new Date(data.registration_date);
  }

  return data;
}

/** expose patient detail query internally */
exports.lookupPatient = handleFetchPatient;

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
    throw new BadRequest('Both `financial` and `medical` information must be provided to register a patient.');
  }

  // Optionally allow client to specify UUID
  finance.uuid = db.bid(finance.uuid || uuid.v4());
  medical.uuid = db.bid(medical.uuid || uuid.v4());

  finance = convert(finance);
  medical = convert(medical);

  medical.debtor_uuid = finance.uuid;

  writeDebtorQuery = 'INSERT INTO debtor (uuid, group_uuid, text) VALUES ' +
    '(?, ?, ?)';

  writePatientQuery = 'INSERT INTO patient SET ?';

  transaction = db.transaction();

  transaction
    .addQuery(writeDebtorQuery, [finance.uuid, finance.debtor_group_uuid, generatePatientText(medical)])
    .addQuery(writePatientQuery, [medical]);

  transaction.execute()
    .then(function (results) {
      res.status(201).json({
        uuid : uuid.unparse(medical.uuid)
      });
    })
    .catch(next)
    .done();
}

// generate default text for the patient's debtor entity.
function generatePatientText(patient) {
  var textLineDefault = 'Patient/';
  return textLineDefault.concat(patient.last_name, '/', patient.middle_name);
}

/**
* Returns details associated to a patient directly and indirectly
*
* @example
* // GET /patients/uuid : Get details associated to a patient directly and indirectly
* var patient = require('medical/patient');
* patient.detail(req, res, next);
*/

/** @todo review if this many details should be returned under a patient end point */
function detail(req, res, next) {

  handleFetchPatient(req.params.uuid)
    .then(function(patientDetail) {
      res.status(200).json(patientDetail);
    })
    .catch(next)
    .done();
}

function update(req, res, next) {
  var updatePatientQuery;
  var data = convert(req.body);
  var patientUuid = req.params.uuid;
  var buid = db.bid(patientUuid);

  // prevent updating the patient's uuid
  delete data.uuid;

  updatePatientQuery =
    'UPDATE patient SET ? WHERE uuid = ?';

  db.exec(updatePatientQuery, [data, buid])
    .then(function (result) {
      return handleFetchPatient(patientUuid);
    })
    .then(function (updatedPatient) {
      res.status(200).json(updatedPatient);
    })
    .catch(next)
    .done();
}

function handleFetchPatient(patientUuid) {

  // convert uuid to database usable binary uuid
  var buid = db.bid(patientUuid);

  var patientDetailQuery =
    `SELECT BUID(p.uuid) as uuid, p.project_id, BUID(p.debtor_uuid) AS debtor_uuid, p.first_name,
      p.last_name, p.middle_name, p.hospital_no, p.sex, p.registration_date, p.email, p.phone, p.dob,
      BUID(p.origin_location_id) as origin_location_id, p.reference, p.title, p.address_1, p.address_2,
      p.father_name, p.mother_name, p.religion, p.marital_status, p.profession, p.employer, p.spouse,
      p.spouse_profession, p.spouse_employer, p.notes, proj.abbr, d.text,
      dg.account_id, BUID(dg.price_list_uuid) AS price_list_uuid, dg.is_convention, BUID(dg.uuid) as debtor_group_uuid,
      dg.locked, dg.name as debtor_group_name
    FROM patient AS p JOIN project AS proj JOIN debtor AS d JOIN debtor_group AS dg
    ON p.debtor_uuid = d.uuid AND d.group_uuid = dg.uuid AND p.project_id = proj.id
    WHERE p.uuid = ?;`;

  return db.exec(patientDetailQuery, buid)
    .then(function (rows) {
      if (rows.length === 0) {
        throw new NotFound(`Could not find a patient with uuid ${patientUuid}`);
      }
      return rows[0];
    });
}

function groups(req, res, next) {
  var patientGroupsQuery;
  var patientExistenceQuery;
  const uid = db.bid(req.params.uuid);

  // just check if the patient exists
  patientExistenceQuery =
    'SELECT uuid FROM patient WHERE uuid = ?;';

  // read patient groups
  patientGroupsQuery =
    `SELECT patient_group.name, patient_group.note, patient_group.created_at, BUID(patient_group.uuid) as uuid
    FROM assignation_patient LEFT JOIN patient_group ON patient_group_uuid = patient_group.uuid
    WHERE patient_uuid = ?`;

  db.exec(patientExistenceQuery, [uid])
    .then(function (rows) {
      if (isEmpty(rows)) {
        throw new NotFound(`Could not find an assignation patient with uuid ${uuid.unparse(uid)}`);
      }

      return db.exec(patientGroupsQuery, [uid]);
    })
    .then(function(patientGroups) {
      res.status(200).json(patientGroups);
    })
    .catch(next)
    .done();
}

function listGroups(req, res, next) {
  var listGroupsQuery =
    `SELECT BUID(uuid) as uuid, name, note, created_at, BUID(price_list_uuid) as price_list_uuid
    FROM patient_group`;

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
  var patientId = db.bid(req.params.uuid);

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
      db.bid(uuid.v4()),
      patientId,
      db.bid(patientGroupId)
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
    `SELECT BUID(p.uuid) AS uuid, p.reference, CONCAT(p.first_name,' ', p.last_name,' ', p.middle_name) AS patientName,
      p.first_name, p.last_name, p.middle_name, CONCAT(pr.abbr, p.reference) AS patientRef, p.dob, p.sex,
      p.registration_date, MAX(pv.date) AS last_visit
    FROM patient AS p
    JOIN project AS pr ON p.project_id = pr.id
    LEFT JOIN patient_visit AS pv ON pv.patient_uuid = p.uuid
    GROUP BY p.uuid
    ORDER BY p.registration_date DESC, p.last_name ASC`;

  db.exec(listPatientsQuery)
  .then(function (result) {
    var patients = result;

    res.status(200).json(patients);
  })
  .catch(next)
  .done();
}

/**
 * This method implements the bhima unique API for hospital numbers; it is
 * responsible for informing the client if a hospital number has been used (is
 * found) or is available (is not found)
 *
 * Exists API:
 * GET /entity/attribute/:id/exists
 * This pattern will be used by the client side service and must be respected
 * by this route.
 *
 * The API here purposefully returns a 200 even if the hospital number cannot
 * be found, this is provide less convoluted logic for the client directive
 * (failure implying success).
 *
 * @returns {Boolean}   true - hospital number passed in has been found
 *                      false - hospital number passed in has not been found
 */
function hospitalNumberExists(req, res, next) {
  var verifyQuery;
  var hospitalNumber = req.params.id;

  verifyQuery =
    `SELECT uuid, hospital_no
    FROM patient
    WHERE hospital_no = ?`;

  db.exec(verifyQuery, [hospitalNumber])
    .then(function (result) {

      // if the result is not empty the hospital number exists (return this Boolean)
      res.status(200).json( !isEmpty(result) );
    })
    .catch(next)
    .done();
}

 /**
 * GET /patient/search/reference/:reference
 * @desc Performs a search on the patient reference (e.g. HBB123)
 * @todo - is this ever used?
 */
function searchReference (req, res, next) {

  var sql, reference = req.params.reference;

  // use MYSQL to look up the reference
  // TODO This could probably be optimized
  sql =
    `SELECT q.uuid, q.project_id, q.debtor_uuid, q.first_name, q.last_name, q.middle_name,
      q.sex, q.dob, q.origin_location_id, q.reference, q.text,
      q.account_id, q.price_list_uuid, q.is_convention, q.locked
    FROM (
      SELECT p.uuid, p.project_id, p.debtor_uuid, p.first_name, p.last_name, p.middle_name,
      p.sex, p.dob, CONCAT(proj.abbr, p.reference) AS reference, p.origin_location_id, d.text,
      dg.account_id, dg.price_list_uuid, dg.is_convention, dg.locked
      FROM patient AS p JOIN project AS proj JOIN debtor AS d JOIN debtor_group AS dg
        ON p.debtor_uuid = d.uuid AND d.group_uuid = dg.uuid AND p.project_id = proj.id
    ) AS q
    WHERE q.reference = ?;`;

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
function searchFuzzy(req, res, next) {

  var sql, match = req.params.match;

  if (!match) { next(new Error('No parameter provided!')); }

  // search on the match parameter
  sql =
    `SELECT BUID(p.uuid) as uuid, p.project_id, BUID(p.debtor_uuid) AS debtor_uuid, p.first_name,
      p.last_name,  p.middle_name, p.sex, p.dob, p.origin_location_id, p.reference, proj.abbr, d.text,
      dg.account_id, BUID(dg.price_list_uuid) as price_list_uuid, dg.is_convention, dg.locked
    FROM patient AS p JOIN project AS proj JOIN debtor AS d JOIN debtor_group AS dg
    ON p.debtor_uuid = d.uuid AND d.group_uuid = dg.uuid AND p.project_id = proj.id
    WHERE
      LEFT(LOWER(CONCAT(p.last_name, \' \', p.middle_name, \' \', p.first_name )), CHAR_LENGTH(?)) = ? OR
      LEFT(LOWER(CONCAT(p.last_name, \' \', p.first_name, \' \', p.middle_name)), CHAR_LENGTH(?)) = ? OR
      LEFT(LOWER(CONCAT(p.first_name, \' \', p.middle_name, \' \', p.last_name)), CHAR_LENGTH(?)) = ? OR
      LEFT(LOWER(CONCAT(p.first_name, \' \', p.last_name, \' \', p.middle_name)), CHAR_LENGTH(?)) = ? OR
      LEFT(LOWER(CONCAT(p.middle_name, \' \', p.last_name, \' \', p.first_name)), CHAR_LENGTH(?)) = ? OR
      LEFT(LOWER(CONCAT(p.middle_name, \' \', p.first_name, \' \', p.last_name)), CHAR_LENGTH(?)) = ?
    LIMIT 10;`;

  // man. That's a lot of matches
  db.exec(sql, [match, match, match, match, match, match, match, match, match, match, match, match])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

function visit(req, res, next) {
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
  var visitId = db.bid(uuid.v4());
  var sql =
    'INSERT INTO `patient_visit` (`uuid`, `patient_uuid`, `registered_by`) VALUES (?, ?, ?)';
  return db.exec(sql, [visitId, db.bid(patientData.uuid), userId]);
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
function search(req, res, next) {

  var sql,
      data       = [],
      qReference = req.query.reference,
      qName      = req.query.name,
      qFields    = req.query.fields,
      qDetail    = req.query.detail || 0,
      qLimit     = req.query.limit;

  try {
    var missingRequiredParameters = (!qReference && !qName && !qFields);
    if (missingRequiredParameters) { throw new BadRequest(`The request requires at least one parameter.`, `ERRORS.PARAMETERS_REQUIRED`); }

    qFields = qFields ? JSON.parse(qFields) : null;
    qDetail = Number(qDetail);
    qLimit  = Number(qLimit);

  } catch (err) {
    // notify the occurence of the error
    return next(err);
  }

  var columns =
      'BUID(q.uuid) AS uuid, q.project_id, q.reference, BUID(q.debtor_uuid) as debtor_uuid, ' +
      'q.first_name, q.last_name, q.middle_name, q.sex, q.dob, q.registration_date ';

  // customize returned columns according detailled results or not
  if (qDetail) {
    columns +=
      `, q.abbr, q.father_name, q.mother_name, q.profession, q.employer,
      q.spouse, q.spouse_profession, q.spouse_employer, q.religion, q.marital_status,
      q.phone, q.email, q.address_1, q.address_2, q.renewal, BUID(q.origin_location_id) as origin_location_id,
      BUID(q.current_location_id) as current_location_id, q.registration_date, q.title, q.notes, q.hospital_no,
      q.text, q.account_id, BUID(q.price_list_uuid) as price_list_uuid, q.is_convention, q.locked `;
  }

  // build the main part of the sql query
  sql =
    `SELECT ${columns} FROM (
      SELECT p.uuid, p.project_id, CONCAT(proj.abbr, p.reference) AS reference, p.debtor_uuid AS debtor_uuid,
        p.first_name, p.last_name, p.middle_name, p.sex, p.dob, p.father_name, p.mother_name,
        p.profession, p.employer, p.spouse, p.spouse_profession, p.spouse_employer,
        p.religion, p.marital_status, p.phone, p.email, p.address_1, p.address_2,
        p.renewal, p.origin_location_id, p.current_location_id, p.registration_date,
        p.title, p.notes, p.hospital_no, d.text, proj.abbr,
        dg.account_id, dg.price_list_uuid as price_list_uuid, dg.is_convention, dg.locked
      FROM patient AS p JOIN project AS proj JOIN debtor AS d JOIN debtor_group AS dg
        ON p.debtor_uuid = d.uuid AND d.group_uuid = dg.uuid AND p.project_id = proj.id
      ) AS q `;

  // complete the sql query according parameters of search
  // such as by: name, reference or by a set of criteria
  if (qName && !qReference) {
    // Final sql query for finding patient by names : first_name, middle_name or last_name
    sql +=
        `WHERE
        LEFT(LOWER(CONCAT(q.last_name, \' \', q.middle_name, \' \', q.first_name )), CHAR_LENGTH(?)) = ? OR
        LEFT(LOWER(CONCAT(q.last_name, \' \', q.first_name, \' \', q.middle_name)), CHAR_LENGTH(?)) = ? OR
        LEFT(LOWER(CONCAT(q.first_name, \' \', q.middle_name, \' \', q.last_name)), CHAR_LENGTH(?)) = ? OR
        LEFT(LOWER(CONCAT(q.first_name, \' \', q.last_name, \' \', q.middle_name)), CHAR_LENGTH(?)) = ? OR
        LEFT(LOWER(CONCAT(q.middle_name, \' \', q.last_name, \' \', q.first_name)), CHAR_LENGTH(?)) = ? OR
        LEFT(LOWER(CONCAT(q.middle_name, \' \', q.first_name, \' \', q.last_name)), CHAR_LENGTH(?)) = ? `;

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
    return next(
    new BadRequest(`The request requires at least one parameter.`, `ERRORS.PARAMETERS_REQUIRED`)
  );
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

function billingServices(req, res, next) {
  const uid = db.bid(req.params.uuid);

  /** @todo (OPTIMISATION) Two additional SELECTs to select group uuids can be written as JOINs. */
  var patientsServiceQuery =

    // get the final information needed to apply billing services to an invoice
    'SELECT DISTINCT ' +
      'billing_service_id, label, description, value, billing_service.created_at ' +
    'FROM ' +

      // get all of the billing services from patient group subscriptions
      '(SELECT * ' +
      'FROM patient_group_billing_service ' +
      'WHERE patient_group_billing_service.patient_group_uuid in ' +

        // find all of the patients groups
        '(SELECT patient_group_uuid ' +
        'FROM assignation_patient ' +
        'WHERE patient_uuid = ?) ' +
    'UNION ' +

      // get all of the billing services from debtor group subscriptions
      'SELECT * ' +
      'FROM debtor_group_billing_service ' +
      'WHERE debtor_group_uuid = ' +

        // find the debtor group uuid
        '(SELECT debtor_group_uuid ' +
        'FROM debtor ' +
        'LEFT JOIN patient ' +
        'ON patient.debtor_uuid = debtor.uuid ' +
        'WHERE patient.uuid = ?)' +
      ') AS patient_services ' +

    // apply billing service information to rows retrieved from service subscriptions
    'LEFT JOIN billing_service ' +
    'ON billing_service_id = billing_service.id';

  db.exec(patientsServiceQuery, [uid, uid])
    .then(function (result) {
      res.status(200).json(result);
    })
    .catch(next)
    .done();
}

function priceLists(req, res, next) {
  var uid = db.bid(req.params.uuid);

  // var patientPriceListQuery = '
    // 'SELECT * FROM price_lists
  // var patientPricesQuery =
  //   'SELECT
}

function subsidies(req, res, next) {
  const uid = db.bid(req.params.uuid);

  var patientsSubsidyQuery =

    // subsidy information required to apply subsidies to an invoice
    'SELECT DISTINCT ' +
      'subsidy_id, label, description, value, subsidy.created_at ' +
    'FROM ' +

      // get all of subsidies from patient group subscriptions
      '(SELECT * ' +
      'FROM patient_group_subsidy ' +
      'WHERE patient_group_subsidy.patient_group_uuid in ' +

        // find all of the patients groups
        '(SELECT patient_group_uuid ' +
        'FROM assignation_patient ' +
        'WHERE patient_uuid = ?) ' +
    'UNION ' +

      // get all subsidies from debtor group subscriptions
      'SELECT * ' +
      'FROM debtor_group_subsidy ' +
      'WHERE debtor_group_uuid = ' +

        // find the debtor group uuid
        '(SELECT debtor_group_uuid ' +
        'FROM debtor ' +
        'LEFT JOIN patient ' +
        'ON patient.debtor_uuid = debtor.uuid ' +
        'WHERE patient.uuid = ?)' +
      ') AS patient_services ' +

    // apply subsidy information to rows retrived from subsidy subscriptions
    'LEFT JOIN subsidy ' +
    'ON subsidy_id = subsidy.id';

  db.exec(patientsSubsidyQuery, [uid, uid])
    .then(function (result) {
      res.status(200).json(result);
    })
    .catch(next)
    .done();
}