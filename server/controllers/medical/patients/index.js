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
 * @requires @ima-worldhealth/topic
 * @requires lib/db
 * @requires lib/uuid/v4
 * @requires lib/errors/BadRequest
 * @requires lib/errors/NotFound
 * @requires lib/barcode
 * @requires lib/filter
 *
 * @requires config/identifiers
 *
 * @requires medical/patients/groups
 * @requires medical/patients/documents
 * @requires medical/patients/vists
 * @requires medical/patients/pictures
 */

const _ = require('lodash');
const uuid = require('uuid/v4');
const topic = require('@ima-worldhealth/topic');

const identifiers = require('../../../config/identifiers');

const barcode = require('../../../lib/barcode');
const db = require('../../../lib/db');
const FilterParser = require('../../../lib/filter');
const BadRequest = require('../../../lib/errors/BadRequest');
const NotFound = require('../../../lib/errors/NotFound');
const Debtors = require('../../finance/debtors');

const groups = require('./groups');
const documents = require('./documents');
const visits = require('./visits');
const pictures = require('./pictures');

// bind submodules
exports.groups = groups;
exports.documents = documents;
exports.visits = visits;
exports.pictures = pictures;

// create a new patient
exports.create = create;

// get details of a patient
exports.detail = detail;

// update patient informations
exports.update = update;

// get list of patients
// search patients
exports.read = read;

exports.searchByName = searchByName;
exports.find = find;

// check if a hospital file number is assigned to any patients
exports.hospitalNumberExists = hospitalNumberExists;

/** @todo discuss if these should be handled by the entity APIs or by patients. */
exports.invoicingFees = invoicingFees;
exports.subsidies = subsidies;

/** expose patient detail query internally */
exports.lookupPatient = lookupPatient;

/** expose custom method to lookup patients by their debtor uuid */
exports.lookupByDebtorUuid = lookupByDebtorUuid;

exports.getFinancialStatus = getFinancialStatus;
exports.getDebtorBalance = getDebtorBalance;

/** @todo Method handles too many operations */
function create(req, res, next) {
  const createRequestData = req.body;

  let { medical, finance } = createRequestData;

  // Debtor group required for financial modelling
  const invalidParameters = !finance || !medical;
  if (invalidParameters) {
    next(new BadRequest('Both financial and medical information must be provided to register a patient.'));
    return;
  }

  // optionally allow client to specify UUID
  const financeUuid = finance.uuid || uuid();
  finance.uuid = financeUuid;
  const medicalUuid = medical.uuid || uuid();
  medical.uuid = medicalUuid;

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

  const writeDebtorQuery = 'INSERT INTO debtor (uuid, group_uuid, text) VALUES (?, ?, ?)';
  const writePatientQuery = 'INSERT INTO patient SET ?';

  const transaction = db.transaction();

  transaction
    .addQuery(writeDebtorQuery, [finance.uuid, finance.debtor_group_uuid, generatePatientText(medical)])
    .addQuery(writePatientQuery, [medical]);

  transaction.execute()
    .then(() => {
      res.status(201).json({
        uuid : medicalUuid,
      });

      // publish a CREATE event on the medical channel
      topic.publish(topic.channels.MEDICAL, {
        event : topic.events.CREATE,
        entity : topic.entities.PATIENT,
        user_id : req.session.user.id,
        uuid : medicalUuid,
      });
    })
    .catch(next)
    .done();
}

// generate default text for the patient's debtor entity.
function generatePatientText(patient) {
  const textLineDefault = 'Patient/';
  return textLineDefault.concat(patient.display_name);
}

/**
 * @method detail
 *
 * @description
 * Returns details associated to a patient directly and indirectly.
 */
function detail(req, res, next) {
  lookupPatient(req.params.uuid)
    .then((patient) => {
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
    .then(() => updatePatientDebCred(patientUuid))
    .then(() => lookupPatient(patientUuid))
    .then((updatedPatient) => {
      res.status(200).json(updatedPatient);

      // publish an UPDATE event on the medical channel
      topic.publish(topic.channels.MEDICAL, {
        event : topic.events.UPDATE,
        entity : topic.entities.PATIENT,
        user_id : req.session.user.id,
        uuid : patientUuid,
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

  // @FIXME(sfount) ALL patient queries should use the same column selection and guarantee the same information
  const sql = `
    SELECT BUID(p.uuid) as uuid, p.project_id, BUID(p.debtor_uuid) AS debtor_uuid, p.display_name, p.hospital_no,
      p.sex, p.registration_date, p.email, p.phone, p.dob, p.dob_unknown_date,
      p.health_zone, p.health_area, BUID(p.origin_location_id) as origin_location_id,
      BUID(p.current_location_id) as current_location_id,
      CONCAT_WS('.', '${identifiers.PATIENT.key}', proj.abbr, p.reference) AS reference, p.title, p.address_1,
      p.address_2, p.father_name, p.mother_name, p.religion, p.marital_status, p.profession, p.employer, p.spouse,
      p.spouse_profession, p.spouse_employer, p.notes, p.avatar, proj.abbr, d.text,
      dg.account_id, BUID(dg.price_list_uuid) AS price_list_uuid, dg.is_convention, BUID(dg.uuid) as debtor_group_uuid,
      dg.locked, dg.name as debtor_group_name, u.username, u.display_name AS userName, a.number
    FROM patient AS p JOIN project AS proj JOIN debtor AS d JOIN debtor_group AS dg JOIN user AS u JOIN account AS a
      ON p.debtor_uuid = d.uuid AND d.group_uuid = dg.uuid
      AND p.project_id = proj.id AND p.user_id = u.id
      AND a.id = dg.account_id
    WHERE p.uuid = ?;
  `;

  return db.one(sql, buid, patientUuid, 'patient')
    .then((patient) => {
      _.extend(patient, {
        barcode : barcode.generate(identifiers.PATIENT.key, patient.uuid),
      });

      return patient;
    });
}


/**
 * @method updatePatientDebCred
 *
 * @description
 * This function is used to update the text value of the creditor
 * and debitor tables in case the patient's name was changed
 *
 * @param {String} patientUuid - the patient's unique id hex string
 */

function updatePatientDebCred(patientUuid) {
  // convert uuid to database usable binary uuid
  const buid = db.bid(patientUuid);

  const sql = `
    SELECT BUID(debtor.uuid) AS debtorUuid, BUID(employee.creditor_uuid) AS creditorUuid, patient.display_name
    FROM debtor
    JOIN patient ON patient.debtor_uuid = debtor.uuid
    LEFT JOIN employee ON employee.patient_uuid = patient.uuid
    WHERE patient.uuid = ?
  `;

  return db.exec(sql, buid)
    .then((row) => {
      const debtorUuid = db.bid(row[0].debtorUuid);
      const creditorUuid = db.bid(row[0].creditorUuid);

      const debtorText = {
        text : `Debiteur [${row[0].display_name}]`,
      };

      const creditorText = {
        text : `Crediteur [${row[0].display_name}]`,
      };

      const updateCreditor = `UPDATE creditor SET ? WHERE creditor.uuid = ?`;
      const updateDebtor = `UPDATE debtor SET ? WHERE debtor.uuid = ?`;

      const transaction = db.transaction();

      transaction
        .addQuery(updateDebtor, [debtorText, debtorUuid])
        .addQuery(updateCreditor, [creditorText, creditorUuid]);

      return transaction.execute();
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
      BUID(p.origin_location_id) as origin_location_id, p.title, p.address_1, p.address_2,
      CONCAT_WS('.', '${identifiers.PATIENT.key}', proj.abbr, p.reference) AS reference,
      p.father_name, p.mother_name, p.religion, p.marital_status, p.profession, p.employer, p.spouse,
      p.spouse_profession, p.spouse_employer, p.notes, p.avatar, proj.abbr, d.text,
      dg.account_id, BUID(dg.price_list_uuid) AS price_list_uuid, dg.is_convention, BUID(dg.uuid) as debtor_group_uuid,
      dg.locked, dg.name as debtor_group_name, u.username, a.number
    FROM patient AS p
    JOIN project AS proj JOIN debtor AS d JOIN debtor_group AS dg JOIN user AS u JOIN account AS a
      ON p.debtor_uuid = d.uuid AND d.group_uuid = dg.uuid
      AND p.project_id = proj.id
      AND p.user_id = u.id
      AND a.id = dg.account_id
    WHERE p.debtor_uuid = ?;
  `;

  return db.exec(sql, buid)
    .then((rows) => {
      if (!rows.length) {
        throw new NotFound(`Could not find a patient with debtor uuid ${debtorUuid}`);
      }

      return rows[0];
    });
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
  const hospitalNumber = req.params.id;

  const verifyQuery =
    'SELECT uuid, hospital_no FROM patient WHERE hospital_no = ?';

  db.exec(verifyQuery, [hospitalNumber])
    .then((result) => {
      // if the result is not empty the hospital number exists (return this Boolean)
      res.status(200).json(!_.isEmpty(result));
    })
    .catch(next)
    .done();
}

/*
 * @method searchByName
 *
 * @description
 * This method implements a patient search that will only ever return very limited
 * information, it does not require many JOINs and will respond with UUIDs for patients
 * that match the requested name.
 */
function searchByName(req, res, next) {
  // filter parser not implemented - all other params should be ignored
  const searchValue = req.query.display_name;
  const searchParameter = `%${searchValue}%`;

  if (_.isUndefined(searchValue)) {
    return next(new BadRequest('display_name attribute must be specified for a name search'));
  }

  // current default limit - this could be defined through req.query if there is a need for this
  const limit = 10;

  const sql = `
    SELECT
      BUID(patient.uuid) as uuid, display_name,
      CONCAT_WS('.', '${identifiers.PATIENT.key}', project.abbr, patient.reference) as reference, debtor_group.color
    FROM patient
    JOIN project ON patient.project_id = project.id
    JOIN debtor ON patient.debtor_uuid = debtor.uuid
    JOIN debtor_group ON debtor.group_uuid = debtor_group.uuid
    WHERE LOWER(display_name) LIKE ?
    LIMIT ${limit}
  `;

  return db.exec(sql, [searchParameter])
    .then((results) => res.send(results))
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
  // ensure epected options are parsed appropriately as binary
  db.convert(options, ['patient_group_uuid', 'debtor_group_uuid', 'debtor_uuid']);

  const filters = new FilterParser(options, {
    tableAlias : 'p',
  });
  const sql = patientEntityQuery(options.detailed);

  filters.equals('debtor_uuid');
  filters.fullText('display_name');
  filters.dateFrom('dateBirthFrom', 'dob');
  filters.dateTo('dateBirthTo', 'dob');
  filters.equals('health_zone');
  filters.equals('health_area');

  // filters for location
  const orignSql = `(originVillage.name LIKE ?) OR (originSector.name LIKE ?) OR (originProvince.name LIKE ?)`;
  const params1 = _.fill(Array(3), `%${options.originLocationLabel || ''}%`);
  filters.customMultiParameters('originLocationLabel', orignSql, params1);
  // default registration date
  filters.period('period', 'registration_date');
  filters.dateFrom('custom_period_start', 'registration_date');
  filters.dateTo('custom_period_end', 'registration_date');

  const patientGroupStatement =
    '(SELECT COUNT(uuid) FROM patient_assignment where patient_uuid = p.uuid AND patient_group_uuid = ?) = 1';
  filters.custom('patient_group_uuid', patientGroupStatement);
  filters.equals('debtor_group_uuid', 'group_uuid', 'd');
  filters.equals('sex');
  filters.equals('hospital_no');
  filters.equals('user_id');

  const referenceStatement =
    `CONCAT_WS('.', '${identifiers.PATIENT.key}', proj.abbr, p.reference) = ?`;
  filters.custom('reference', referenceStatement);

  // @TODO Support ordering query (reference support for limit)?
  filters.setOrder('ORDER BY p.registration_date DESC');

  // applies filters and limits to defined sql, get parameters in correct order
  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();

  return db.exec(query, parameters);
}

function patientEntityQuery(detailed) {
  let detailedColumns = '';

  // if the find should included detailed results
  if (detailed) {
    detailedColumns = `
      , proj.abbr, p.father_name, p.mother_name, p.profession, p.employer,
      p.spouse, p.spouse_profession, p.spouse_employer, p.religion, p.marital_status,
      p.phone, p.email, p.address_1, p.address_2, BUID(p.origin_location_id) as origin_location_id,
      BUID(p.current_location_id) as current_location_id, p.registration_date, p.title, p.notes, d.text,
      dg.account_id, BUID(dg.price_list_uuid) as price_list_uuid, dg.is_convention, dg.locked
    `;
  }

  // @TODO Investigate if this origin alias table as 'q' does JOINs on every single patient row
  //       _before_selecting.
  // build the main part of the SQL query
  const sql = `
    SELECT
      BUID(p.uuid) AS uuid, p.project_id, CONCAT_WS('.', '${identifiers.PATIENT.key}',
      proj.abbr, p.reference) AS reference, p.display_name, BUID(p.debtor_uuid) as debtor_uuid,
      p.sex, p.dob, p.registration_date, BUID(d.group_uuid) as debtor_group_uuid, p.hospital_no,
      p.health_zone, p.health_area, u.display_name as userName, originVillage.name as originVillageName, dg.color,
      originSector.name as originSectorName, dg.name AS debtorGroupName,
      originProvince.name as originProvinceName ${detailedColumns}
    FROM patient AS p
      JOIN project AS proj ON p.project_id = proj.id
      JOIN debtor AS d ON p.debtor_uuid = d.uuid
      JOIN debtor_group AS dg ON d.group_uuid = dg.uuid
      JOIN village as originVillage ON originVillage.uuid = p.origin_location_id
      JOIN sector AS originSector ON originVillage.sector_uuid = originSector.uuid
      JOIN province AS originProvince ON originProvince.uuid = originSector.province_uuid
      JOIN user AS u ON p.user_id = u.id
  `;

  return sql;
}

/**
 * @method read
 *
 * @description
 * A multi-parameter function that uses find() to query the database for
 * patient records.  It is the HTTP interface to find().
 *
 * @example
 * // GET /patient/?name={string}&detail={boolean}&limit={number}
 * // GET /patient/?reference={string}&detail={boolean}&limit={number}
 * // GET /patient/?fields={object}
 * // GET /patient
 */
function read(req, res, next) {
  find(req.query)
    .then((rows) => {
      // publish a SEARCH event on the medical channel
      topic.publish(topic.channels.MEDICAL, {
        event : topic.events.SEARCH,
        entity : topic.entities.PATIENT,
        user_id : req.session.user.id,
      });

      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}


function invoicingFees(req, res, next) {
  const uid = db.bid(req.params.uuid);

  // @todo (OPTIMISATION) Two additional SELECTs to select group uuids can be written as JOINs.
  const patientsServiceQuery =

    // get the final information needed to apply invoicing fees to an invoice
    'SELECT DISTINCT ' +
    'invoicing_fee_id, label, description, value, invoicing_fee.created_at ' +
    'FROM ' +

    // get all of the invoicing fees from patient group subscriptions
    '(SELECT * ' +
    'FROM patient_group_invoicing_fee ' +
    'WHERE patient_group_invoicing_fee.patient_group_uuid in ' +

    // find all of the patients groups
    '(SELECT patient_group_uuid ' +
    'FROM patient_assignment ' +
    'WHERE patient_uuid = ?) ' +
    'UNION ' +

    // get all of the invoicing fees from debtor group subscriptions
    'SELECT * ' +
    'FROM debtor_group_invoicing_fee ' +
    'WHERE debtor_group_uuid = ' +

    // find the debtor group uuid
    '(SELECT debtor.group_uuid ' +
    'FROM patient ' +
    'LEFT JOIN debtor ' +
    'ON patient.debtor_uuid = debtor.uuid ' +
    'WHERE patient.uuid = ?)' +
    ') AS patient_services ' +

    // apply billing service information to rows retrieved from service subscriptions
    'LEFT JOIN invoicing_fee ' +
    'ON invoicing_fee_id = invoicing_fee.id';

  db.exec(patientsServiceQuery, [uid, uid])
    .then((result) => {
      res.status(200).json(result);
    })
    .catch(next)
    .done();
}

function subsidies(req, res, next) {
  const uid = db.bid(req.params.uuid);

  const patientsSubsidyQuery =

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
    'FROM patient_assignment ' +
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
    .then((result) => {
      res.status(200).json(result);
    })
    .catch(next)
    .done();
}

/**
 * @function getFinancialStatus
 *
 * @description
 * returns the financial activity of the patient.
 */
function getFinancialStatus(req, res, next) {
  const uid = req.params.uuid;
  const data = {};

  lookupPatient(uid)
    .then(patient => {
      _.extend(data, { patient });
      return Debtors.getFinancialActivity(patient.debtor_uuid);
    })
    .then(({ transactions, aggregates }) => {
      _.extend(data, { transactions, aggregates });

      res.status(200).send(data);
    })
    .catch(next)
    .done();
}

/**
 * @function getDebtorBalance
 *
 * @description
 * returns the patient's debtor balance with the enterprise.  Note that this
 * route provides a "real-time" balance, so it scans both the posting_journal
 * and general_ledger.
 */
function getDebtorBalance(req, res, next) {
  const uid = req.params.uuid;
  lookupPatient(uid)
    .then(patient => {
      return Debtors.balance(patient.debtor_uuid);
    })
    .then(([balance]) => {
      res.status(200).send(balance);
    })
    .catch(next)
    .done();
}
