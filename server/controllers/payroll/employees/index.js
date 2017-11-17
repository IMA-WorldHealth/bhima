/**
 * @module employees
 *
 * @description
 * This controller is responsible for implementing all crud on the
 * employees table through the `/employees` endpoint.
 * The /employees HTTP API endpoint
 *
 * NOTE: This api does not handle the deletion of employees because
 * that subject is not in the actuality.
 *
 * @requires db
 * @requires uuid
 * @requires NotFound
 * @requires topic
 * @requires filter
 */


const uuid = require('uuid/v4');

const db = require('./../../../lib/db');
const topic = require('../../../lib/topic');
const NotFound = require('./../../../lib/errors/NotFound');
const FilterParser = require('./../../../lib/filter');

exports.list = list;
exports.create = create;
exports.update = update;
exports.detail = detail;
exports.search = search;
exports.find = find;

/**
 * @method list
 *
 * @description
 * Returns an array of each employee in the database
 */
function list(req, res, next) {
  find(req.query)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
 * Get list of availaible holidays for an employee
 */
exports.listHolidays = function listHolidays(req, res, next) {
  const pp = JSON.parse(req.params.pp);
  const sql =
    `SELECT holiday.id, holiday.label, holiday.dateFrom, holiday.percentage, holiday.dateTo
     FROM holiday WHERE
       ((holiday.dateFrom >= ? AND holiday.dateFrom <= ?)
       (holiday.dateTo >= ? AND holiday.dateTo <= ?) OR
       (holiday.dateFrom <= ? AND holiday.dateTo >= ?)) AND
       holiday.employee_id = ?;`;

  const data = [
    pp.dateFrom, pp.dateTo,
    pp.dateFrom, pp.dateTo,
    pp.dateFrom, pp.dateFrom,
    req.params.employee_id,
  ];

  db.exec(sql, data)
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
};

/**
 * Check an existing holiday
 */
exports.checkHoliday = function checkHoliday(req, res, next) {
  let sql =
    `SELECT id, employee_id, label, dateTo, percentage, dateFrom FROM holiday WHERE employee_id = ?
     AND ((dateFrom >= ?) OR (dateTo >= ?) OR (dateFrom >= ?) OR (dateTo >= ?))
     AND ((dateFrom <= ?) OR (dateTo <= ?) OR (dateFrom <= ?) OR (dateTo <= ?))`;

  const data = [
    req.query.employee_id,
    req.query.dateFrom, req.query.dateFrom, req.query.dateTo, req.query.dateTo,
    req.query.dateFrom, req.query.dateFrom, req.query.dateTo, req.query.dateTo,
  ];

  if (req.query.line !== '') {
    sql += ' AND id <> ?';
    data.push(req.query.line);
  }

  db.exec(sql, data)
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
};

/**
 * Check an existing offday
 */
exports.checkOffday = function checkHoliday(req, res, next) {
  const sql = `SELECT * FROM offday WHERE date = ? AND id <> ?`;
  db.exec(sql, [req.query.date, req.query.id])
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
};

/**
 * @method lookupEmployee
 *
 * @description
 * Looks up an employee in the database by their id.
 *
 * @param {Number} id - the id of the employee to look up
 * @returns {Promise} - the result of the database query.
 */
function lookupEmployee(id) {
  const sql =
    `
    SELECT 
      employee.id, employee.code, patient.display_name, patient.sex, 
      patient.dob, employee.date_embauche, employee.service_id,
      employee.nb_spouse, employee.nb_enfant, BUID(employee.grade_uuid) as grade_uuid,
      employee.locked, employee.is_medical, grade.text, grade.basic_salary,
      fonction.id AS fonction_id, fonction.fonction_txt, service.name AS service_txt, patient.hospital_no,
      patient.phone, patient.email, patient.address_1 AS adresse, BUID(employee.patient_uuid) AS patient_uuid, employee.bank, employee.bank_account,
      employee.daily_salary, grade.code AS code_grade, BUID(debtor.uuid) as debtor_uuid,
      debtor.text AS debtor_text, BUID(debtor.group_uuid) as debtor_group_uuid,
      BUID(creditor.uuid) as creditor_uuid, creditor.text AS creditor_text,
      BUID(creditor.group_uuid) as creditor_group_uuid, creditor_group.account_id,
      BUID(current_location_id) as current_location_id, BUID(origin_location_id) as origin_location_id
    FROM employee
      JOIN grade ON employee.grade_uuid = grade.uuid
      LEFT JOIN fonction ON employee.fonction_id = fonction.id
      JOIN patient ON patient.uuid = employee.patient_uuid
      JOIN debtor ON patient.debtor_uuid = debtor.uuid
      JOIN creditor ON employee.creditor_uuid = creditor.uuid
      JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid
      LEFT JOIN service ON service.id = employee.service_id 
    WHERE employee.id = ?;
  `;

  return db.one(sql, [id], id, 'employee');
}

/**
 * @method detail
 *
 * @description
 * Returns an object of details of an employee referenced by an `id` in the database
 */
function detail(req, res, next) {
  lookupEmployee(req.params.id)
    .then(record => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

/**
 * @method update
 *
 * @description
 * Update details of an employee referenced by an `id` in the database
 */
function update(req, res, next) {
  const employee = db.convert(req.body, [
    'grade_uuid', 'debtor_group_uuid', 'creditor_group_uuid', 'creditor_uuid', 'debtor_uuid', 'patient_uuid', 'current_location_id', 'origin_location_id',
  ]);

  if (employee.dob) {
    employee.dob = new Date(employee.dob);
  }

  if (employee.date_embauche) {
    employee.date_embauche = new Date(employee.date_embauche);
  }

  const creditor = {
    uuid : employee.creditor_uuid,
    group_uuid : employee.creditor_group_uuid,
    text : `Crediteur [${employee.display_name}]`,
  };

  const debtor = {
    uuid : employee.debtor_uuid,
    group_uuid : employee.debtor_group_uuid,
    text : `Debiteur [${employee.display_name}]`,
  };

  const patient = {
    display_name : employee.display_name,
    dob : employee.dob,
    current_location_id : employee.current_location_id,
    origin_location_id : employee.origin_location_id,
    hospital_no : employee.hospital_no,
    sex : employee.sex,
    phone : employee.phone,
    email : employee.email,
    address_1 : employee.adresse
  };

  const clean = {          
    date_embauche : employee.date_embauche,
    service_id : employee.service_id,
    nb_spouse : employee.nb_spouse,
    nb_enfant : employee.nb_enfant,
    grade_uuid : employee.grade_uuid,
    locked : employee.locked,
    fonction_id : employee.fonction_id,
    bank : employee.bank,
    bank_account : employee.bank_account,
    daily_salary : employee.daily_salary,
    code : employee.code,
    is_medical : employee.is_medical,
  };

  const updateCreditor = `UPDATE creditor SET ? WHERE creditor.uuid = ?`;
  const updateDebtor = `UPDATE debtor SET ? WHERE debtor.uuid = ?`;
  const updatePatient = `UPDATE patient SET ? WHERE uuid = ?`;
  const sql = `UPDATE employee SET ? WHERE employee.id = ?`;

  const transaction = db.transaction();

  transaction
    .addQuery(updateCreditor, [creditor, creditor.uuid])
    .addQuery(updateDebtor, [debtor, debtor.uuid])
    .addQuery(updatePatient, [patient, employee.patient_uuid])
    .addQuery(sql, [clean, req.params.id]);

  transaction.execute()
    .then(results => {

      if (!results[3].affectedRows) {
        throw new NotFound(`Could not find an employee with id ${req.params.id}.`);
      }

      topic.publish(topic.channels.ADMIN, {
        event : topic.events.UPDATE,
        entity : topic.entities.EMPLOYEE,
        user_id : req.session.user.id,
        id : req.params.id,
      });

      return lookupEmployee(req.params.id);
    })
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
 * This function is responsible for creating a new employee in the database
 */
function create(req, res, next) {
  // cast as data object and add unique ids
  const data = req.body;
  const patientID = uuid();
  data.creditor_uuid = uuid();
  data.debtor_uuid = uuid();
  data.patient_uuid = patientID;

  // convert uuids to binary uuids as necessary
  const employee = db.convert(data, [
    'grade_uuid', 'debtor_group_uuid', 'creditor_group_uuid', 'creditor_uuid',
    'debtor_uuid', 'current_location_id', 'origin_location_id', 'patient_uuid',
  ]);

  if (employee.dob) {
    employee.dob = new Date(employee.dob);
  }

  if (employee.date_embauche) {
    employee.date_embauche = new Date(employee.date_embauche);
  }

  const creditor = {
    uuid : employee.creditor_uuid,
    group_uuid : employee.creditor_group_uuid,
    text : `Crediteur [${employee.display_name}]`,
  };

  const debtor = {
    uuid : employee.debtor_uuid,
    group_uuid : employee.debtor_group_uuid,
    text : `Debiteur [${employee.display_name}]`,
  };

  const patient = {
    uuid : employee.patient_uuid,
    project_id : req.session.project.id,
    display_name : employee.display_name,
    dob : employee.dob,
    current_location_id : employee.current_location_id,
    origin_location_id : employee.origin_location_id,
    hospital_no : employee.hospital_no,
    debtor_uuid : employee.debtor_uuid,
    user_id : req.session.user.id,
    sex : employee.sex,
  };

  delete employee.debtor_group_uuid;
  delete employee.creditor_group_uuid;
  delete employee.current_location_id;
  delete employee.origin_location_id;
  delete employee.debtor_uuid;
  delete employee.hospital_no;

  //Delete not necessary Data for Employee
  delete employee.display_name;
  delete employee.dob;
  delete employee.sex;
  delete employee.adresse;
  delete employee.phone;
  delete employee.email;

  const writeCreditor = 'INSERT INTO creditor SET ?';
  const writeDebtor = 'INSERT INTO debtor SET ?';
  const writePatient = 'INSERT INTO patient SET ?';
  const sql = 'INSERT INTO employee SET ?';

  const transaction = db.transaction();

  transaction
    .addQuery(writeCreditor, [creditor])
    .addQuery(writeDebtor, [debtor])
    .addQuery(writePatient, [patient])
    .addQuery(sql, [employee]);

  transaction.execute()
    .then(results => {
      // @todo - why is this not a UUID, but grade_uuid is a uuid?
      const employeeId = results[3].insertId;

      topic.publish(topic.channels.ADMIN, {
        event : topic.events.CREATE,
        entity : topic.entities.EMPLOYEE,
        user_id : req.session.user.id,
        id : employeeId,
      });

      res.status(201).json({ id : employeeId, patient_uuid : patientID });
    })
    .catch(next)
    .done();
}

/**
 * @method search
 *
 * @description
 * A multi-parameter function that uses find() to query the database for
 * employee records.
 *
 * @example
 * // GET /employees/search?name={string}&detail={boolean}&limit={number}
 * // GET /employees/search?reference={string}&detail={boolean}&limit={number}
 * // GET /employees/search?fields={object}
 */
function search(req, res, next) {
  find(req.query)
    .then((rows) => {
    // publish a SEARCH event on the medical channel
      topic.publish(topic.channels.MEDICAL, {
        event   : topic.events.SEARCH,
        entity  : topic.entities.PATIENT,
        user_id : req.session.user.id,
      });

      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
 * @method find
 *
 * @description
 * This function scans the employee table in the database to find all values
 * matching parameters provided in the options parameter.
 *
 * @param {Object} options - a JSON of query parameters
 * @returns {Promise} - the result of the promise query on the database.
 */
function find(options) {
  const sql =
    `SELECT 
      employee.id, employee.code, patient.display_name, patient.sex, 
      patient.dob, employee.date_embauche, employee.service_id, employee.nb_spouse, 
      employee.nb_enfant, BUID(employee.grade_uuid) as grade_uuid, employee.locked,
      grade.text, grade.basic_salary, fonction.id AS fonction_id, fonction.fonction_txt, patient.hospital_no,
      patient.phone, patient.email, patient.address_1 AS adresse, BUID(employee.patient_uuid) AS patient_uuid, employee.bank, employee.bank_account,
      employee.daily_salary, employee.is_medical, grade.code AS code_grade, BUID(debtor.uuid) as debtor_uuid,
      debtor.text AS debtor_text, BUID(debtor.group_uuid) as debtor_group_uuid,
      BUID(creditor.uuid) as creditor_uuid, creditor.text AS creditor_text,
      BUID(creditor.group_uuid) as creditor_group_uuid, creditor_group.account_id,
      BUID(current_location_id) as current_location_id, BUID(origin_location_id) as origin_location_id,
      service.name as service_name
    FROM employee
     JOIN grade ON employee.grade_uuid = grade.uuid
     LEFT JOIN fonction ON employee.fonction_id = fonction.id
     JOIN patient ON patient.uuid = employee.patient_uuid
     JOIN debtor ON patient.debtor_uuid = debtor.uuid
     JOIN creditor ON employee.creditor_uuid = creditor.uuid
     JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid
     LEFT JOIN service ON service.id = employee.service_id
  `;
  // ensure epected options are parsed appropriately as binary
  db.convert(options, ['grade_uuid', 'creditor_uuid', 'patient_uuid']);

  const filters = new FilterParser(options, { tableAlias : 'employee' });

  filters.fullText('display_name', 'display_name', 'patient');
  filters.dateFrom('dateEmbaucheFrom', 'date_embauche');
  filters.dateTo('dateEmbaucheTo', 'date_embauche');
  filters.dateFrom('dateBirthFrom', 'dob', 'patient');
  filters.dateTo('dateBirthTo', 'dob', 'patient');
  filters.equals('sex', 'sex', 'patient');
  filters.equals('code', 'code', 'employee');
  filters.equals('service_id', 'service_id', 'employee');
  filters.equals('fonction_id', 'fonction_id', 'employee');
  filters.equals('grade_uuid', 'grade_uuid', 'employee');
  filters.equals('is_medical', 'is_medical', 'employee');

  // @TODO Support ordering query
  filters.setOrder('ORDER BY patient.display_name DESC');


  // applies filters and limits to defined sql, get parameters in correct order
  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();

  return db.exec(query, parameters);
}
