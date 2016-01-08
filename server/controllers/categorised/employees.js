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
* @requires lib/sanitize
*
* NOTE: This api does not handle the deletion of employees because
* that subject is not in the actuality.
*/

'use strict';

var db = require('./../../lib/db');
var util = require('./../../lib/util');
var sanitize = require('./../../lib/sanitize');

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
    '((hollyday.dateFrom>=' + sanitize.escape(util.toMysqlDate(pp.dateFrom)) + ' AND ' +
    'hollyday.dateFrom<=' + sanitize.escape(util.toMysqlDate(pp.dateTo)) + ') OR ' +
    '(hollyday.dateTo>=' + sanitize.escape(util.toMysqlDate(pp.dateFrom)) + ' AND ' +
    'hollyday.dateTo<=' + sanitize.escape(util.toMysqlDate(pp.dateTo)) + ') OR ' +
    '(hollyday.dateFrom<=' + sanitize.escape(util.toMysqlDate(pp.dateFrom)) + ' AND ' +
    'hollyday.dateTo>=' + sanitize.escape(util.toMysqlDate(pp.dateTo)) + ')) AND ' +
    'hollyday.employee_id=' + sanitize.escape(req.params.employee_id) + ';';

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(next)
  .done();
};

/**
* Check an existing holiday
*/
exports.checkHoliday = function (req, res, next) {
  var sql = 'SELECT id, employee_id, label, dateTo, percentage, dateFrom FROM hollyday WHERE employee_id = "'+ req.query.employee_id +'"' +
          ' AND ((dateFrom >= "' + req.query.dateFrom +'") OR (dateTo >= "' + req.query.dateFrom + '") OR (dateFrom >= "'+ req.query.dateTo +'")' +
          ' OR (dateTo >= "' + req.query.dateTo + '"))' +
          ' AND ((dateFrom <= "' + req.query.dateFrom +'") OR (dateTo <= "' + req.query.dateFrom + '") OR (dateFrom <= "'+ req.query.dateTo +'")' +
          ' OR (dateTo <= "' + req.query.dateTo + '"))';
  if (req.query.line !== ''){
    sql += ' AND id <> "' + req.query.line + '"';
  }

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(next)
  .done();
};

/**
* Check an existing offday
*/
exports.checkOffday = function (req, res, next) {
  var sql ='SELECT * FROM offday WHERE date = ? AND id <> ?';
  db.exec(sql, [req.query.date, req.query.id])
  .then(function (result) {
    res.send(result);
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
exports.details = function (req, res, next) {
  var sql =
  'SELECT ' +
  'employee.id, employee.code AS code_employee, employee.prenom, employee.name, ' +
  'employee.postnom, employee.sexe, employee.dob, employee.date_embauche, employee.service_id, ' +
  'employee.nb_spouse, employee.nb_enfant, employee.grade_id, employee.locked, grade.text, grade.basic_salary, ' +
  'fonction.id AS fonction_id, fonction.fonction_txt, service.name AS service_txt, ' +
  'employee.phone, employee.email, employee.adresse, employee.bank, employee.bank_account, employee.daily_salary, employee.location_id, ' +
  'grade.code AS code_grade, debitor.uuid as debitor_uuid, debitor.text AS debitor_text,debitor.group_uuid as debitor_group_uuid, ' +
  'creditor.uuid as creditor_uuid, creditor.text AS creditor_text, creditor.group_uuid as creditor_group_uuid, creditor_group.account_id ' +
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
    // send a 204 if rows is empty
    if (!rows.length) {
      return res.status(204).json({
        code   : 'SUCCES_NO_CONTENT',
        reason : 'No employee found by id ' + req.params.id
      });
    }
    res.status(200).json(rows);
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
exports.update = function (req, res, next) {
  var sql = 'UPDATE employee SET ? WHERE employee.id = ?';

  db.exec(sql, [req.body, req.params.id])
  .then(function (row) {
    if (!row.affectedRows) { return res.status(204).json(row); }
    res.status(200).json(row);
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
exports.create = function (req, res, next) {
  var sql =
      'INSERT INTO employee (' +
      'code, prenom, name, postnom, sexe, dob, date_embauche, nb_spouse, nb_enfant, ' +
      'grade_id, daily_salary, bank, bank_account, adresse, phone, email, ' +
      'fonction_id, service_id, location_id, creditor_uuid, debitor_uuid) VALUES ' +
      '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  var data = [
    req.body.code, req.body.prenom, req.body.name, req.body.postnom, req.body.sexe,
    req.body.dob, req.body.date_embauche, req.body.nb_spouse, req.body.nb_enfant,
    req.body.grade_id, req.body.daily_salary, req.body.bank, req.body.bank_account,
    req.body.adresse, req.body.phone, req.body.email, req.body.fonction_id, req.body.service_id,
    req.body.location_id, req.body.creditor_uuid, req.body.debitor_uuid
  ];

  db.exec(sql, data)
  .then(function (row) {
    res.status(201).json({ id: row.insertId });
  })
  .catch(next)
  .done();
};
