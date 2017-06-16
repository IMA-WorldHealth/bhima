/**
 * @module fiscalPeriod
 *
 * @description
 * This controller is responsible for implementing all crud on the
 * fiscal year period trough the `/period` endpoint.
 *
 * @requires db
 * @requires NotFound
 * @requires topic
 * @requires filter
 */



const db = require('./../../../lib/db');
const topic = require('../../../lib/topic');
const NotFound = require('./../../../lib/errors/NotFound');
const FilterParser = require('./../../../lib/filter');

exports.list = list;
exports.find = find;

/**
 * @method list
 *
 * @description
 * Returns an array of period
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
      employee.id, employee.code AS code, employee.display_name, employee.sex, 
      employee.dob, employee.date_embauche, employee.service_id, employee.nb_spouse, 
      employee.nb_enfant, BUID(employee.grade_id) as grade_id, employee.locked,
      grade.text, grade.basic_salary, fonction.id AS fonction_id, fonction.fonction_txt,
      employee.phone, employee.email, employee.adresse, employee.bank, employee.bank_account,
      employee.daily_salary, grade.code AS code_grade, BUID(debtor.uuid) as debtor_uuid,
      debtor.text AS debtor_text, BUID(debtor.group_uuid) as debtor_group_uuid,
      BUID(creditor.uuid) as creditor_uuid, creditor.text AS creditor_text,
      BUID(creditor.group_uuid) as creditor_group_uuid, creditor_group.account_id,
      service.name as service_name
    FROM employee
     JOIN grade ON employee.grade_id = grade.uuid
     LEFT JOIN fonction ON employee.fonction_id = fonction.id
     JOIN patient ON patient.uuid = employee.patient_uuid
     JOIN debtor ON patient.debtor_uuid = debtor.uuid
     JOIN creditor ON employee.creditor_uuid = creditor.uuid
     JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid
     LEFT JOIN service ON service.id = employee.service_id
  `;
  // ensure epected options are parsed appropriately as binary
  db.convert(options, ['grade_id', 'creditor_uuid', 'patient_uuid']);

  const filters = new FilterParser(options, { tableAlias : 'employee', autoParseStatements : false });

  filters.fullText('display_name');
  filters.dateFrom('dateEmbaucheFrom', 'date_embauche');
  filters.dateTo('dateEmbaucheTo', 'date_embauche');
  filters.dateFrom('dateBirthFrom', 'dob');
  filters.dateTo('dateBirthTo', 'dob');
  filters.equals('sex', 'sex', 'employee');
  filters.equals('code', 'code', 'employee');
  filters.equals('service_id', 'service_id', 'employee');
  filters.equals('fonction_id', 'fonction_id', 'employee');
  filters.equals('grade_id', 'grade_id', 'employee');

  // @TODO Support ordering query
  filters.setOrder('ORDER BY employee.display_name DESC');

  // applies filters and limits to defined sql, get parameters in correct order
  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();
  return db.exec(query, parameters);
}

