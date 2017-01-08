'use strict';

/**
 * @module medical/patient
 *
 * @description
 * The /patient HTTP API endpoint
 *
 * @description
 * This module is responsible for handling all crud operations relatives to patients
 * and define all patient API functions.
 *
 *
 * @requires q
 * @requires lodash
 * @requires lib/node-uuid
 * @requires util
 * @requires lib/db
 * @requires lib/topic
 * @requires lib/node-uuid
 * @requires lib/errors/BadRequest
 * @requires lib/errors/NotFound
 * @requires medical/patients/groups
 * @requires medical/patients/documents
 * @requires medical/patients/checkin
 * @requires medical/patients/pictures
 *
 * @todo Review naming conventions
 * @todo Remove or refactor methods to fit new API standards
 */

const _      = require('lodash');
const q      = require('q');
const uuid   = require('node-uuid');
const moment = require('moment');

const identifiers = require('../../../config/identifiers');
const barcode = require('../../../lib/barcode');

const util   = require('../../../lib/util');
const db     = require('../../../lib/db');
const topic  = require('../../../lib/topic');

const BadRequest  = require('../../../lib/errors/BadRequest');
const NotFound    = require('../../../lib/errors/NotFound');

const groups    = require('./groups');
const documents = require('./documents');
const checkin   = require('./checkin');
const pictures  = require('./pictures');

// bind submodules
exports.groups    = groups;
exports.documents = documents;
exports.checkin   = checkin;
exports.pictures  = pictures;

// create a new patient
exports.create = create;

// get details of a patient
exports.detail = detail;

// update patient informations
exports.update = update;

// get list of patients
exports.list = list;

// search patients
exports.search = search;
exports.find = find;

// check if a hospital file number is assigned to any patients
exports.hospitalNumberExists = hospitalNumberExists;

/** @todo discuss if these should be handled by the entity APIs or by patients. */
exports.billingServices = billingServices;
exports.subsidies = subsidies;

/** expose patient detail query internally */
exports.lookupPatient = lookupPatient;

/** expose custom method to lookup patients by their debtor uuid */
exports.lookupByDebtorUuid = lookupByDebtorUuid;

// Get the latest patient Invoice
exports.latestInvoice = latestInvoice;

/** @todo Method handles too many operations */
function create(req, res, next) {
  let patientText;

  const createRequestData = req.body;

  let medical = createRequestData.medical;
  let finance = createRequestData.finance;

  // Debtor group required for financial modelling
  let invalidParameters = !finance || !medical;
  if (invalidParameters) {
    return next(
      new BadRequest(
        `Both 'financial' and 'medical' information must be provided to register a patient.`
      )
    );
  }

  // optionally allow client to specify UUID
  finance.uuid = finance.uuid || uuid.v4();
  medical.uuid = medical.uuid || uuid.v4();

  medical.user_id = req.session.user.id;

  if (medical.dob) {
    medical.dob = new Date(medical.dob);
  }

  if (medical.registration_date) {
    medical.registration_date = new Date(medical.registration_date);
  }

  finance = db.convert(finance, ['uuid', 'debtor_group_uuid']);
  medical = db.convert(medical, ['uuid', 'current_location_id', 'origin_location_id']);
  medical.debtor_uuid = finance.uuid;

  let writeDebtorQuery = 'INSERT INTO debtor (uuid, group_uuid, text) VALUES (?, ?, ?)';
  let writePatientQuery = 'INSERT INTO patient SET ?';

  let transaction = db.transaction();

  transaction
    .addQuery(writeDebtorQuery, [finance.uuid, finance.debtor_group_uuid, generatePatientText(medical)])
    .addQuery(writePatientQuery, [medical]);

  transaction.execute()
    .then(function (results) {
      res.status(201).json({
        uuid : uuid.unparse(medical.uuid)
      });

      // publish a CREATE event on the medical channel
      topic.publish(topic.channels.MEDICAL, {
        event: topic.events.CREATE,
        entity: topic.entities.PATIENT,
        user_id: req.session.user.id,
        uuid: uuid.unparse(medical.uuid)
      });
    })
    .catch(next)
    .done();
}

// generate default text for the patient's debtor entity.
function generatePatientText(patient) {
  var textLineDefault = 'Patient/';
  return textLineDefault.concat(patient.display_name );
}

/**
 * @method detail
 *
 * @description
 * Returns details associated to a patient directly and indirectly.
 */
function detail(req, res, next) {
  lookupPatient(req.params.uuid)
    .then(function(patient) {
      res.status(200).json(patient);
    })
    .catch(next)
    .done();
}

/**
 * @method update
 *
 * @description
 * Updates a patient group
 */
function update(req, res, next) {
  const data = db.convert(req.body, ['debtor_uuid', 'current_location_id', 'origin_location_id']);
  const patientUuid = req.params.uuid;
  const buid = db.bid(patientUuid);

  // sanitize date
  if (data.dob) {
    data.dob = new Date(data.dob);
  }

  // prevent updating the patient's uuid
  delete data.uuid;
  delete data.reference;

  const updatePatientQuery =
    'UPDATE patient SET ? WHERE uuid = ?';

  db.exec(updatePatientQuery, [data, buid])
    .then(function (result) {
      return lookupPatient(patientUuid);
    })
    .then(function (updatedPatient) {
      res.status(200).json(updatedPatient);

      // publish an UPDATE event on the medical channel
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

/**
 * @method lookupPatient
 *
 * @description
 * This function looks up a patient by its unique id.  If the patient doesn't
 * exist, it throws a NOT FOUND error.
 *
 * @param {String} patientUuid - the patient's unique id hex string
 * @returns {Promise} - the result of the database query
 */
function lookupPatient(patientUuid) {

  // convert uuid to database usable binary uuid
  const buid = db.bid(patientUuid);

  const sql = `
    SELECT BUID(p.uuid) as uuid, p.project_id, BUID(p.debtor_uuid) AS debtor_uuid, p.display_name, p.hospital_no,
      p.sex, p.registration_date, p.email, p.phone, p.dob, BUID(p.origin_location_id) as origin_location_id,
      CONCAT_WS('.', '${identifiers.PATIENT}', proj.abbr, p.reference) AS reference, p.title, p.address_1, p.address_2,
      p.father_name, p.mother_name, p.religion, p.marital_status, p.profession, p.employer, p.spouse,
      p.spouse_profession, p.spouse_employer, p.notes, p.avatar, proj.abbr, d.text,
      dg.account_id, BUID(dg.price_list_uuid) AS price_list_uuid, dg.is_convention, BUID(dg.uuid) as debtor_group_uuid,
      dg.locked, dg.name as debtor_group_name, u.username, u.display_name AS userName
    FROM patient AS p JOIN project AS proj JOIN debtor AS d JOIN debtor_group AS dg JOIN user AS u
    ON p.debtor_uuid = d.uuid AND d.group_uuid = dg.uuid AND p.project_id = proj.id AND p.user_id = u.id
    WHERE p.uuid = ?;
  `;

  return db.one(sql, buid, patientUuid, 'patient')
    .then(function (patient) {
      patient.barcode = barcode.generate(identifiers.PATIENT, patient.uuid);
      return patient;
    });
}

/**
 * @method lookupByDebtorUuid
 *
 * @description
 * This function looks up a patient by its debtor uuid.  Since uuids are
 * globally unique, there should be a 1->1 map of debtor_uuids to patients.  If
 * no record is found, it throws a NOT FOUND error.
 *
 * @param {String} debtorUuid - the patient's unique debtor id hex string
 * @returns {Promise} - the result of the database query
 */
function lookupByDebtorUuid(debtorUuid) {

  // convert uuid to database usable binary uuid
  const buid = db.bid(debtorUuid);

  const sql = `
    SELECT BUID(p.uuid) as uuid, p.project_id, BUID(p.debtor_uuid) AS debtor_uuid, p.display_name,
      p.hospital_no, p.sex, p.registration_date, p.email, p.phone, p.dob,
      BUID(p.origin_location_id) as origin_location_id, CONCAT_WS('.', '${identifiers.PATIENT}', proj.abbr, p.reference) AS reference,
      p.title, p.address_1, p.address_2, p.father_name, p.mother_name, p.religion, p.marital_status, p.profession, p.employer, p.spouse,
      p.spouse_profession, p.spouse_employer, p.notes, p.avatar, proj.abbr, d.text,
      dg.account_id, BUID(dg.price_list_uuid) AS price_list_uuid, dg.is_convention, BUID(dg.uuid) as debtor_group_uuid,
      dg.locked, dg.name as debtor_group_name, u.username, a.number
    FROM patient AS p JOIN project AS proj JOIN debtor AS d JOIN debtor_group AS dg JOIN user AS u JOIN account AS a
    ON p.debtor_uuid = d.uuid AND d.group_uuid = dg.uuid AND p.project_id = proj.id AND p.user_id = u.id AND a.id = dg.account_id
    WHERE p.debtor_uuid = ?;
  `;

  return db.exec(sql, buid)
    .then(function (rows) {
      if (!rows.length) {
        throw new NotFound(`Could not find a patient with debtor uuid ${debtorUuid}`);
      }

      return rows[0];
    });
}

function list(req, res, next) {
  var listPatientsQuery;

  listPatientsQuery =
    `SELECT BUID(p.uuid) AS uuid, p.display_name,
      CONCAT_WS('.', '${identifiers.PATIENT}', pr.abbr, p.reference) AS reference,
      p.dob, p.sex, p.registration_date, p.hospital_no, MAX(pv.start_date) AS last_visit, u.display_name AS userName
    FROM patient AS p
    JOIN project AS pr ON p.project_id = pr.id
    JOIN user AS u ON p.user_id = u.id
    LEFT JOIN patient_visit AS pv ON pv.patient_uuid = p.uuid
    GROUP BY p.uuid
    ORDER BY p.registration_date DESC, p.display_name ASC
  `;

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
  let hospitalNumber = req.params.id;

  let verifyQuery =
    'SELECT uuid, hospital_no FROM patient WHERE hospital_no = ?';

  db.exec(verifyQuery, [hospitalNumber])
    .then(function (result) {

      // if the result is not empty the hospital number exists (return this Boolean)
      res.status(200).json( !_.isEmpty(result) );
    })
    .catch(next)
    .done();
}


/**
 * @method find
 *
 * @description
 * This function scans the patient table in the database to find all values
 * matching parameters provided in the options parameter.
 *
 * @param {Object} options - a JSON of query parameters
 * @returns {Promise} - the result of the promise query on the database.
 */
function find(options) {
  // remove the limit first thing, if it exists
  let limit = Number(options.limit);
  delete options.limit;

  // support flexible queries by keeping a growing list of conditions and
  // statements
  let conditions = {
    statements: [],
    parameters: []
  };

  // if nothing is passed in as an option, throw an error
  if (_.isEmpty(options)) {
    return q.reject(
      new BadRequest('The request requires at least one parameter.', 'ERRORS.PARAMETERS_REQUIRED')
    );
  }

  let detailedColumns = '';

  // if the find should included detailed results
  if (options.detailed) {
      detailedColumns = `
        , q.abbr, q.father_name, q.mother_name, q.profession, q.employer, q.hospital_no,
        q.spouse, q.spouse_profession, q.spouse_employer, q.religion, q.marital_status,
        q.phone, q.email, q.address_1, q.address_2, q.renewal, BUID(q.origin_location_id) as origin_location_id,
        BUID(q.current_location_id) as current_location_id, q.registration_date, q.title, q.notes, q.text,
        q.account_id, BUID(q.price_list_uuid) as price_list_uuid, q.is_convention, q.locked
      `;

    // remove options.detailed so that it cannot be used again
    delete options.detailed;
  }

  // build the main part of the SQL query
  let sql = `
    SELECT BUID(q.uuid) AS uuid, q.project_id, q.reference, q.display_name, BUID(q.debtor_uuid) as debtor_uuid,
      q.sex, q.dob, q.registration_date, BUID(q.debtor_group_uuid) as debtor_group_uuid, q.hospital_no, q.last_visit, q.userName ${detailedColumns}
    FROM (
      SELECT p.uuid, p.project_id, CONCAT_WS('.', '${identifiers.PATIENT}', proj.abbr, p.reference) AS reference,
        p.display_name, p.debtor_uuid AS debtor_uuid, p.sex, p.dob, p.father_name, p.mother_name, p.profession,
        p.employer, p.spouse, p.spouse_profession, p.spouse_employer, p.religion, p.marital_status, p.phone,
        p.email, p.address_1, p.address_2, p.renewal, p.origin_location_id, p.current_location_id,
        p.registration_date, p.title, p.notes, p.hospital_no, p.user_id, d.text, proj.abbr, dg.account_id,
        dg.price_list_uuid as price_list_uuid, dg.is_convention, dg.locked, MAX(pv.start_date) AS last_visit,
        dg.uuid AS debtor_group_uuid, u.display_name AS userName
        FROM patient AS p
        JOIN project AS proj ON p.project_id = proj.id
        JOIN debtor AS d ON p.debtor_uuid = d.uuid
        JOIN debtor_group AS dg ON d.group_uuid = dg.uuid
        JOIN user AS u ON p.user_id = u.id
        LEFT JOIN patient_visit AS pv ON pv.patient_uuid = p.uuid
        GROUP BY p.uuid
      ) AS q WHERE
  `;

  // this is every permutation of the first, last, and middle name combinations you can imagine.
  if (options.name) {
    let keyValue = '%' + options.name + '%';

    conditions.statements.push('LOWER(q.display_name) LIKE ? ');
    conditions.parameters.push(keyValue);

    // remove options.name so that it cannot be used again
    delete options.name;
  }

  // impose lower limit on registration dates
  if (options.dateRegistrationFrom) {
    conditions.statements.push('DATE(q.registration_date) >= DATE(?)');
    conditions.parameters.push(new Date(options.dateRegistrationFrom));
    delete options.dateRegistrationFrom;
  }

  // impose upper limit on registration dates
  if (options.dateRegistrationTo) {
    conditions.statements.push('DATE(q.registration_date) <= DATE(?)');
    conditions.parameters.push(new Date(options.dateRegistrationTo));
    delete options.dateRegistrationTo;
  }

  // impose lower limit on birth dates
  if (options.dateBirthFrom) {
    conditions.statements.push('DATE(q.dob) >= DATE(?)');
    conditions.parameters.push(new Date(options.dateBirthFrom));
    delete options.dateBirthFrom;
  }

  // impose upper limit on birth dates
  if (options.dateBirthTo) {
    conditions.statements.push('DATE(q.dob) <= DATE(?)');
    conditions.parameters.push(new Date(options.dateBirthTo));
    delete options.dateBirthTo;
  }

  if (options.patient_group_uuid) {
    conditions.statements.push('(SELECT COUNT(uuid) FROM assignation_patient where patient_uuid = q.uuid AND patient_group_uuid = ?) = 1');
    conditions.parameters.push(db.bid(options.patient_group_uuid));
    delete options.patient_group_uuid;
  }

  // use util.queryCondition to fill out the rest of the query
  sql += conditions.statements.join(' AND ');

  // @fixme HACK to add final AND
  if (conditions.statements.length && !_.isEmpty(options)) { sql += ' AND '; }
  let query = util.queryCondition(sql, options, true);

  // destructure the query object from util.queryCondition
  sql = query.query;
  let parameters = conditions.parameters.concat(query.conditions);

  // finally, apply the LIMIT query
  if (!isNaN(limit)) {
    sql += 'LIMIT ?;';
    parameters.push(limit);
  }

  // if nothing was submitted to the search, get all records
  if (!parameters.length) {

    // this writes in WHERE 1; to the SQL query
    sql += ' 1;';
  }

  return db.exec(sql, parameters);
}

/**
 * @method search
 *
 * @description
 * A multi-parameter function that uses find() to query the database for
 * patient records.  It is the HTTP interface to find().
 *
 * @example
 * // GET /patient/search?name={string}&detail={boolean}&limit={number}
 * // GET /patient/search?reference={string}&detail={boolean}&limit={number}
 * // GET /patient/search?fields={object}
 */
function search(req, res, next) {
  find(req.query)
  .then(function (rows) {

    // publish a SEARCH event on the medical channel
    topic.publish(topic.channels.MEDICAL, {
      event: topic.events.SEARCH,
      entity: topic.entities.PATIENT,
      user_id: req.session.user.id,
    });

    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}


function billingServices(req, res, next) {
  const uid = db.bid(req.params.uuid);

  // @todo (OPTIMISATION) Two additional SELECTs to select group uuids can be written as JOINs.
  let patientsServiceQuery =

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
        '(SELECT debtor.group_uuid ' +
        'FROM patient ' +
        'LEFT JOIN debtor ' +
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
        '(SELECT group_uuid ' +
        'FROM patient ' +
        'JOIN debtor ' +
        'ON patient.debtor_uuid = debtor.uuid ' +
        'WHERE patient.uuid = ?)' +
      ') AS patient_subsidies ' +

    // apply subsidy information to rows retrieved from subsidy subscriptions
    'LEFT JOIN subsidy ' +
    'ON subsidy_id = subsidy.id';

  db.exec(patientsSubsidyQuery, [uid, uid])
    .then(function (result) {
      res.status(200).json(result);
    })
    .catch(next)
    .done();
}

function loadLatestInvoice(latestInvoice) {
  const debtorID = latestInvoice.debtor_uuid;
  const invoiceID = latestInvoice.uuid;

  const sql =
    `SELECT BUID(i.uuid) as uid, CONCAT_WS('.', '${identifiers.INVOICE}', project.abbr, reference) AS reference,
        credit, debit, (debit - credit) as balance, BUID(entity_uuid) as entity_uuid
      FROM (
        SELECT uuid, SUM(debit) as debit, SUM(credit) as credit, entity_uuid
        FROM (
          SELECT record_uuid as uuid, debit_equiv as debit, credit_equiv as credit, entity_uuid
          FROM combined_ledger
          WHERE record_uuid IN (?) AND entity_uuid = ?
        UNION ALL
          SELECT reference_uuid as uuid, debit_equiv as debit, credit_equiv as credit, entity_uuid
          FROM  combined_ledger
          WHERE reference_uuid IN (?) AND entity_uuid = ?
        ) AS ledger
        GROUP BY entity_uuid
      ) AS i JOIN invoice ON i.uuid = invoice.uuid
      JOIN project ON invoice.project_id = project.id `;

  const sql2 =
    `SELECT COUNT(i.uuid) as numberPayment
      FROM (
        SELECT uuid,  debit, credit, entity_uuid
        FROM (
          SELECT record_uuid as uuid, debit_equiv as debit, credit_equiv as credit, entity_uuid
          FROM combined_ledger
          WHERE record_uuid IN (?) AND entity_uuid = ? AND debit_equiv = 0
        UNION ALL
          SELECT reference_uuid as uuid, debit_equiv as debit, credit_equiv as credit, entity_uuid
          FROM  combined_ledger
          WHERE reference_uuid IN (?) AND entity_uuid = ? AND debit_equiv = 0
        ) AS ledger
      ) AS i JOIN invoice ON i.uuid = invoice.uuid
      JOIN project ON invoice.project_id = project.id `;

  const sql3 =
    `SELECT COUNT(invoice.uuid) as 'invoicesLength'
       FROM invoice
       JOIN user ON user.id = invoice.user_id
       WHERE debtor_uuid = ? AND invoice.uuid NOT IN (SELECT voucher.reference_uuid FROM voucher WHERE voucher.type_id = 10)
       ORDER BY date DESC`;


  const execSql = db.one(sql, [invoiceID, debtorID, invoiceID, debtorID]);
  const execSql2 = db.one(sql2, [invoiceID, debtorID, invoiceID, debtorID]);
  const execSql3 = db.one(sql3, [debtorID]);

  return q.all([execSql, execSql2, execSql3])
    .spread(function (invoice, payment, invoicesLength) {

      // collapse all returned values into a single object
      const merged = _.assign({}, invoice, payment, invoicesLength);

      // columns
      const columns = [
        'uuid', 'debitor_uuid', 'numberPayment', 'date', 'cost', 'display_name',
        'reference', 'credit', 'debit', 'balance', 'entity_uuid', 'invoicesLength',
        'cost', 'debtor_uuid', 'uid'
      ];

      return _.pick(merged, columns);
    });
}

/*
 Search for information about the latest patient Invoice
 */
function latestInvoice(req, res, next) {
  const uid = req.params.uuid;

  const REVERSE_TYPE_ID = 10;

  const sql = `
    SELECT invoice.uuid, invoice.debtor_uuid, invoice.date, user.display_name, invoice.cost
    FROM invoice
    JOIN user ON user.id = invoice.user_id
    WHERE debtor_uuid = ?
    AND invoice.uuid NOT IN (SELECT voucher.reference_uuid FROM voucher WHERE voucher.type_id = ${REVERSE_TYPE_ID})
    ORDER BY date DESC
    LIMIT 1;
  `;

  let latestInv;

  db.exec(sql, [db.bid(uid)])
    .then(results => {
      let hasLatestInvoice  = results.length > 0;
      latestInv = results[0];
      let skip = q({}); // fake promise to simply skip the latest invoice loading.
      return hasLatestInvoice ? loadLatestInvoice(latestInv) : skip;
    })
    .then(invoice => {
      latestInv = _.extend(latestInv, invoice);
      res.status(200).json(latestInv);
    })
    .catch(next)
    .done();
}
