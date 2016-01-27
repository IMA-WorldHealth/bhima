/**
* The /employees HTTP API endpoint
*
* @module categorised/employees
*
* @description This controller is responsible for implementing all crud on the
* employees table through the `/employees` endpoint.
*
* @requires lib/db
* @requires lib/util
* @requires config/codes
*
* NOTE: This api does not handle the deletion of employees because
* that subject is not in the actuality.
*/

'use strict';

var db = require('./../../lib/db');
var util = require('./../../lib/util');

/**
* Returns an array of each employee in the database
*
* @param {object} request The express request object
* @param {object} response The express response object
* @param {object} next The express middleware next object
*
* @example
* // GET /employees : Get list of employees
* var employees = require('categorised/employees');
* employees.list(request, response, next);
*/
exports.list = function (req, res, next) {
  var sql =
    'SELECT ' +
    'employee.id, employee.code AS code_employee, employee.prenom, employee.name, ' +
    'employee.postnom, employee.sexe, employee.dob, employee.date_embauche, employee.service_id, ' +
    'employee.nb_spouse, employee.nb_enfant, employee.grade_id, employee.locked, grade.text, grade.basic_salary, ' +
    'fonction.id AS fonction_id, fonction.fonction_txt, ' +
    'employee.phone, employee.email, employee.adresse, employee.bank, employee.bank_account, employee.daily_salary, employee.location_id, ' +
    'grade.code AS code_grade, debitor.uuid as debitor_uuid, debitor.text AS debitor_text,debitor.group_uuid as debitor_group_uuid, ' +
    'creditor.uuid as creditor_uuid, creditor.text AS creditor_text, creditor.group_uuid as creditor_group_uuid, creditor_group.account_id ' +
    'FROM employee ' +
    ' JOIN grade ON employee.grade_id = grade.uuid ' +
    ' JOIN fonction ON employee.fonction_id = fonction.id ' +
    ' JOIN debitor ON employee.debitor_uuid = debitor.uuid ' +
    ' JOIN creditor ON employee.creditor_uuid = creditor.uuid ' +
    ' JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid ' +
    ' ORDER BY employee.name ASC, employee.postnom ASC, employee.prenom ASC';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

/**
* Get list of availaible holidays for an employee
*/
exports.listHolidays = function (req, res, next) {
  var pp = JSON.parse(req.params.pp);
  var sql =
    'SELECT hollyday.id, hollyday.label, hollyday.dateFrom, hollyday.percentage, hollyday.dateTo ' +
    'FROM hollyday WHERE ' +
    '((hollyday.dateFrom >= ? AND hollyday.dateFrom <= ?) OR ' +
    '(hollyday.dateTo >= ? AND hollyday.dateTo <= ?) OR ' +
    '(hollyday.dateFrom <= ? AND hollyday.dateTo >a ?)) AND ' +
    'hollyday.employee_id = ? ;';

  var data = [
    pp.dateFrom, pp.dateTo,
    pp.dateFrom, pp.dateTo,
    pp.dateFrom, pp.dateFrom,
    req.params.employee_id
  ];

  db.exec(sql, data)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

/**
* Check an existing holiday
*/
exports.checkHoliday = function (req, res, next) {
  var sql =
    'SELECT id, employee_id, label, dateTo, percentage, dateFrom FROM hollyday WHERE employee_id = ?' +
    ' AND ((dateFrom >= ?) OR (dateTo >= ?) OR (dateFrom >= ?) OR (dateTo >= ?))' +
    ' AND ((dateFrom <= ?) OR (dateTo <= ?) OR (dateFrom <= ?) OR (dateTo <= ?))';

  var data = [
    req.query.employee_id,
    req.query.dateFrom, req.query.dateFrom, req.query.dateTo, req.query.dateTo,
    req.query.dateFrom, req.query.dateFrom, req.query.dateTo, req.query.dateTo
  ];

  if (req.query.line !== '') {
    sql += ' AND id <> ?';
    data.push(req.query.line);
  }

  db.exec(sql, data)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

/**
* Check an existing offday
*/
exports.checkOffday = function checkHoliday(req, res, next) {
  var sql ='SELECT * FROM offday WHERE date = ? AND id <> ?';
  db.exec(sql, [req.query.date, req.query.id])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

/**
* Returns an object of details of an employee referenced by an `id` in the database
*
* @param {object} request The express request object
* @param {object} response The express response object
* @param {object} next The express middleware next object
*
* @example
* // GET /employees/:id : Get details of an employee
* var employees = require('categorised/employees');
* employees.details(request, response, next);
*/
exports.detail = function detail(req, res, next) {
  var sql =
  'SELECT employee.id, employee.code AS code_employee, employee.prenom, employee.name, ' +
    'employee.postnom, employee.sexe, employee.dob, employee.date_embauche, employee.service_id, ' +
    'employee.nb_spouse, employee.nb_enfant, employee.grade_id, employee.locked, grade.text, grade.basic_salary, ' +
    'fonction.id AS fonction_id, fonction.fonction_txt, service.name AS service_txt, ' +
    'employee.phone, employee.email, employee.adresse, employee.bank, employee.bank_account, ' +
    'employee.daily_salary, employee.location_id, grade.code AS code_grade, debitor.uuid as debitor_uuid, ' +
    'debitor.text AS debitor_text,debitor.group_uuid as debitor_group_uuid, creditor.uuid as creditor_uuid, ' +
    'creditor.text AS creditor_text, creditor.group_uuid as creditor_group_uuid, creditor_group.account_id ' +
  'FROM employee ' +
  ' JOIN grade ON employee.grade_id = grade.uuid ' +
  ' JOIN fonction ON employee.fonction_id = fonction.id ' +
  ' JOIN debitor ON employee.debitor_uuid = debitor.uuid ' +
  ' JOIN creditor ON employee.creditor_uuid = creditor.uuid ' +
  ' JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid ' +
  ' LEFT JOIN service ON service.id = employee.service_id ' +
  'WHERE employee.id = ? ';

  db.exec(sql, [req.params.id])
  .then(function (rows) {

    if (rows.length === 0) {
      throw new req.codes.ERR_NOT_FOUND();
    }

    console.log('[DB] date:', rows[0].date, 'typeof:', typeof rows[0].date);
    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
};

/**
* Update details of an employee referenced by an `id` in the database
*
* @param {object} request The express request object
* @param {object} response The express response object
* @param {object} next The express middleware next object
*
* @example
* // PUT /employees/:id : Update details of an employee
* var employees = require('categorised/employees');
* employees.update(request, response, next);
*/
exports.update = function update(req, res, next) {
  var sql = 'UPDATE employee SET ? WHERE employee.id = ?';
  var employee = req.body;

  if (employee.dob) {
    employee.dob = new Date(employee.dob);
  }
  if (employee.date_embauche) {
    employee.date_embauche = new Date(employee.date_embauche);
  }

  db.exec(sql, [employee, req.params.id])
  .then(function (row) {

    if (!row.affectedRows) {
      throw new req.codes.ERR_NOT_FOUND();
    }

    var sql2 =
      'SELECT employee.id, employee.code AS code_employee, employee.prenom, employee.name, ' +
        'employee.postnom, employee.sexe, employee.dob, employee.date_embauche, employee.service_id, ' +
        'employee.nb_spouse, employee.nb_enfant, employee.grade_id, employee.locked, grade.text, grade.basic_salary, ' +
        'fonction.id AS fonction_id, fonction.fonction_txt, service.name AS service_txt, ' +
        'employee.phone, employee.email, employee.adresse, employee.bank, employee.bank_account, ' +
        'employee.daily_salary, employee.location_id, grade.code AS code_grade, debitor.uuid as debitor_uuid, ' +
        'debitor.text AS debitor_text,debitor.group_uuid as debitor_group_uuid, ' +
        'creditor.uuid as creditor_uuid, creditor.text AS creditor_text, ' +
        'creditor.group_uuid as creditor_group_uuid, creditor_group.account_id ' +
      'FROM employee ' +
        'JOIN grade ON employee.grade_id = grade.uuid ' +
        'JOIN fonction ON employee.fonction_id = fonction.id ' +
        'JOIN debitor ON employee.debitor_uuid = debitor.uuid ' +
        'JOIN creditor ON employee.creditor_uuid = creditor.uuid ' +
        'JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid ' +
        'LEFT JOIN service ON service.id = employee.service_id ' +
      'WHERE employee.id = ? ';

    return db.exec(sql2, [req.params.id]);
  })
  .then(function (rows) {

    if (!rows.length) {
      throw new req.codes.ERR_NOT_FOUND();
    }
    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
};

/**
* This function is responsible for creating a new employee in the database
*
* @param {object} request The express request object
* @param {object} response The express response object
* @param {object} next The express middleware next object
*
* @example
* // POST /employees/ : Create a new employee
* var employees = require('categorised/employees');
* employees.create(request, response, next);
*/
exports.create = function create(req, res, next) {

  var employee = req.body;
  var sql = 'INSERT INTO employee SET ?';

  // ensure dates are MySQL-parseable.
  if (employee.dob) {
    employee.dob = new Date(employee.dob);
  }
  if (employee.date_embauche) {
    employee.date_embauche = new Date(employee.date_embauche);
  }

  // execute the SQL query
  db.exec(sql, [ employee ])
  .then(function (row) {
    res.status(201).json({ id: row.insertId });
  })
  .catch(next)
  .done();
};
