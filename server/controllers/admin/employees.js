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
 * @requires BadRequest
 * @requires Topic
 */

'use strict';

const db = require('./../../lib/db');
const uuid = require('node-uuid');
const NotFound = require('./../../lib/errors/NotFound');
const BadRequest = require('../../lib/errors/BadRequest');
const Topic = require('../../lib/topic');

exports.list = list;
exports.create = create;
exports.update = update;
exports.detail = detail;
exports.search = search;

/**
 * @method list
 *
 * @description
 * Returns an array of each employee in the database
 */
function list(req, res, next) {
  const sql = `
    SELECT employee.id, employee.code AS code_employee, employee.display_name, employee.sexe, employee.dob, employee.date_embauche, employee.service_id,
      employee.nb_spouse, employee.nb_enfant, BUID(employee.grade_id) as grade_id, employee.locked,
      grade.text, grade.basic_salary, fonction.id AS fonction_id, fonction.fonction_txt,
      employee.phone, employee.email, employee.adresse, employee.bank, employee.bank_account,
      employee.daily_salary, BUID(employee.location_id) AS location_id, grade.code AS code_grade,
      BUID(debtor.uuid) as debtor_uuid, debtor.text AS debtor_text, BUID(debtor.group_uuid) as debtor_group_uuid,
      BUID(creditor.uuid) as creditor_uuid, creditor.text AS creditor_text,
      BUID(creditor.group_uuid) as creditor_group_uuid, creditor_group.account_id
    FROM employee
     JOIN grade ON employee.grade_id = grade.uuid
     JOIN fonction ON employee.fonction_id = fonction.id
     JOIN debtor ON employee.debtor_uuid = debtor.uuid
     JOIN creditor ON employee.creditor_uuid = creditor.uuid
     JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid
     ORDER BY employee.display_name ASC;
  `;

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
 * Get list of availaible holidays for an employee
 */
exports.listHolidays = function (req, res, next) {
  let pp = JSON.parse(req.params.pp);
  let sql =
    `SELECT holiday.id, holiday.label, holiday.dateFrom, holiday.percentage, holiday.dateTo
     FROM holiday WHERE
       ((holiday.dateFrom >= ? AND holiday.dateFrom <= ?)
       (holiday.dateTo >= ? AND holiday.dateTo <= ?) OR
       (holiday.dateFrom <= ? AND holiday.dateTo >= ?)) AND
       holiday.employee_id = ?;`;

  let data = [
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
  let sql =
    `SELECT id, employee_id, label, dateTo, percentage, dateFrom FROM holiday WHERE employee_id = ?
     AND ((dateFrom >= ?) OR (dateTo >= ?) OR (dateFrom >= ?) OR (dateTo >= ?))
     AND ((dateFrom <= ?) OR (dateTo <= ?) OR (dateFrom <= ?) OR (dateTo <= ?))`;

  let data = [
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
  let sql ='SELECT * FROM offday WHERE date = ? AND id <> ?';
  db.exec(sql, [req.query.date, req.query.id])
  .then(function (rows) {
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
  let sql = `
    SELECT employee.id, employee.code AS code_employee, employee.display_name, employee.sexe, employee.dob, employee.date_embauche, employee.service_id,
      employee.nb_spouse, employee.nb_enfant, BUID(employee.grade_id) as grade_id,
      employee.locked, grade.text, grade.basic_salary,
      fonction.id AS fonction_id, fonction.fonction_txt, service.name AS service_txt,
      employee.phone, employee.email, employee.adresse, employee.bank, employee.bank_account,
      employee.daily_salary, BUID(employee.location_id) as location_id, grade.code AS code_grade, BUID(debtor.uuid) as debtor_uuid,
      debtor.text AS debtor_text, BUID(debtor.group_uuid) as debtor_group_uuid,
      BUID(creditor.uuid) as creditor_uuid, creditor.text AS creditor_text,
      BUID(creditor.group_uuid) as creditor_group_uuid, creditor_group.account_id
    FROM employee
      JOIN grade ON employee.grade_id = grade.uuid
      JOIN fonction ON employee.fonction_id = fonction.id
      JOIN debtor ON employee.debtor_uuid = debtor.uuid
      JOIN creditor ON employee.creditor_uuid = creditor.uuid
      JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid
      LEFT JOIN service ON service.id = employee.service_id
    WHERE employee.id = ?;
  `;

  return db.exec(sql, [id])
  .then(function (rows) {
    if (rows.length === 0) {
      throw new NotFound(`Could not find an employee with id ${id}.`);
    }

    return rows[0];
  });
}

/**
 * @method detail
 *
 * @description
 * Returns an object of details of an employee referenced by an `id` in the database
 */
function detail(req, res, next) {
  lookupEmployee(req.params.id)
  .then(function (record) {
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
  let employee = db.convert(req.body, [
    'grade_id', 'debtor_group_uuid', 'creditor_group_uuid', 'creditor_uuid', 'debtor_uuid', 'location_id'
  ]);

  if (employee.dob) {
    employee.dob = new Date(employee.dob);
  }

  if (employee.date_embauche) {
    employee.date_embauche = new Date(employee.date_embauche);
  }

  let transaction;

  let creditor = {
    uuid : employee.creditor_uuid,
    group_uuid : employee.creditor_group_uuid,
    text : 'Crediteur [' + employee.display_name + ']'
  };

  let debtor = {
    uuid : employee.debtor_uuid,
    group_uuid : employee.debtor_group_uuid,
    text : 'Debiteur [' + employee.display_name + ']'
  };

  let clean = {
    display_name : employee.display_name,
    sexe : employee.sexe,
    dob : employee.dob,
    date_embauche : employee.date_embauche,
    service_id : employee.service_id,
    nb_spouse : employee.nb_spouse,
    nb_enfant : employee.nb_enfant,
    grade_id : employee.grade_id,
    locked : employee.locked,
    fonction_id : employee.fonction_id,
    phone : employee.phone,
    email : employee.email,
    adresse : employee.adresse,
    bank : employee.bank,
    bank_account : employee.bank_account,
    daily_salary : employee.daily_salary,
    location_id : employee.location_id,
    code : employee.code
  };

  let updateCreditor = 'UPDATE creditor SET ? WHERE creditor.uuid = ?';
  let updateDebtor = 'UPDATE debtor SET ? WHERE debtor.uuid = ?';
  let sql = 'UPDATE employee SET ? WHERE employee.id = ?';

  transaction = db.transaction();

  transaction
    .addQuery(updateCreditor, [creditor, creditor.uuid])
    .addQuery(updateDebtor, [debtor, debtor.uuid])
    .addQuery(sql, [clean, req.params.id]);

  transaction.execute()
    .then(function (results) {
      if (!results[2].affectedRows) {
        throw new NotFound(`Could not find an employee with id ${req.params.id}.`);
      }

      Topic.publish(Topic.channels.ADMIN, {
        event: Topic.events.UPDATE,
        entity: Topic.entities.EMPLOYEE,
        user_id: req.session.user.id,
        id : req.params.id
      });

      return lookupEmployee(req.params.id);
    })
    .then(function (rows) {
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
  let transaction;

  // cast as data object and add unique ids
  let data = req.body;
  data.creditor_uuid = uuid.v4();
  data.debtor_uuid = uuid.v4();

  // convert uuids to binary uuids as necessary
  let employee = db.convert(req.body, [
    'grade_id', 'debtor_group_uuid', 'creditor_group_uuid', 'creditor_uuid', 'debtor_uuid', 'location_id'
  ]);

  if (employee.dob) {
    employee.dob = new Date(employee.dob);
  }

  if (employee.date_embauche) {
    employee.date_embauche = new Date(employee.date_embauche);
  }

  let creditor = {
    uuid : employee.creditor_uuid,
    group_uuid : employee.creditor_group_uuid,
    text : 'Crediteur [' + employee.display_name + ']'
  };

  let debtor = {
    uuid : employee.debtor_uuid,
    group_uuid : employee.debtor_group_uuid,
    text : 'Debiteur [' + employee.display_name + ']'
  };

  delete employee.debtor_group_uuid;
  delete employee.creditor_group_uuid;

  let writeCreditor = 'INSERT INTO creditor SET ?';
  let writeDebtor = 'INSERT INTO debtor SET ?';
  let sql = 'INSERT INTO employee SET ?';

  transaction = db.transaction();

  transaction
    .addQuery(writeCreditor, [creditor])
    .addQuery(writeDebtor, [debtor])
    .addQuery(sql, [employee]);

  transaction.execute()
    .then(function (results) {

      // @todo - why is this not a UUID, but grade_id is a uuid?
      let employeeId = results[2].insertId;

      Topic.publish(Topic.channels.ADMIN, {
        event: Topic.events.CREATE,
        entity: Topic.entities.EMPLOYEE,
        user_id: req.session.user.id,
        id : employeeId
      });

      res.status(201).json({ id: employeeId });
    })
    .catch(next)
    .done();
}

/**
 * @method search
 *
 * @description
 * This function is responsible for looking for employee by display_name or code
 *
 */
function search(req, res, next) {
  let searchOption = '', sql = '';
  let keyValue = '%' + req.params.value + '%';

  if (req.params.key === 'code') {
    searchOption = 'LOWER(employee.code)';
  } else if (req.params.key === 'display_name') {
    searchOption = 'LOWER(employee.display_name)';
  } else {
    return next(
      new BadRequest('You sent a bad value for some parameters in research employee.')
    );
  }

  sql = `
    SELECT
      employee.id, employee.code AS code_employee, employee.display_name, employee.locked, employee.bank, employee.bank_account,
      BUID(creditor.uuid) as creditor_uuid, BUID(creditor.group_uuid) as creditor_group_uuid,
      creditor_group.account_id
    FROM employee
    JOIN creditor ON employee.creditor_uuid = creditor.uuid
    JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid
    WHERE ${searchOption} LIKE ? LIMIT 10;
  `;

  db.exec(sql, [keyValue])
  .then(function (rows) {

    Topic.publish(Topic.channels.ADMIN, {
      event: Topic.events.SEARCH,
      entity: Topic.entities.EMPLOYEE,
      user_id: req.session.user.id
    });

    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}
