/**
* Rubric Controller
*
* This controller exposes an API to the client for reading and writing Rubric
*/

var db = require('../../../lib/db');
var NotFound = require('../../../lib/errors/NotFound');

// GET /Rubric
function lookupRubric(id) {
  var sql =`
    SELECT r.id, r.label, r.abbr, r.is_employee, r.is_percent, r.is_discount, r.is_social_care,
    r.debtor_account_id, r.expense_account_id, r.is_ipr, r.value, r.is_tax 
    FROM rubric_payroll AS r  
    WHERE r.id = ?`;

  return db.one(sql, [id]);
}

// Lists the Payroll Rubrics
function list(req, res, next) {
  const sql = `
    SELECT r.id, r.label, r.abbr, r.is_employee, r.is_percent, r.is_discount, r.is_social_care,  
    r.debtor_account_id, a4.number AS four_number, a4.label AS four_label, 
    r.expense_account_id, a6.number AS six_number, a6.label AS six_label, r.is_ipr, r.value, r.is_tax
    FROM rubric_payroll AS r
    JOIN account AS a4 ON a4.id = r.debtor_account_id
    JOIN account AS a6 ON a6.id = r.expense_account_id   
  ;`;

  db.exec(sql)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
* GET /Rubric/:ID
*
* Returns the detail of a single Rubric
*/
function detail(req, res, next) {
  var id = req.params.id;

  lookupRubric(id)
    .then((record) => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// POST /Rubric
function create(req, res, next) {
  const sql = `INSERT INTO rubric_payroll SET ?`;
  const data = req.body;

  db.exec(sql, [data])
    .then((row) => {
      res.status(201).json({ id : row.insertId });
    })
    .catch(next)
    .done();
}


// PUT /Rubric /:id
function update(req, res, next) {
  const sql = `UPDATE rubric_payroll SET ? WHERE id = ?;`;

  db.exec(sql, [req.body, req.params.id])
    .then(() => {
      return lookupRubric(req.params.id);
    })
    .then((record) => {
    // all updates completed successfull, return full object to client
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// DELETE /Rubric/:id
function del(req, res, next) {
  const sql = `DELETE FROM rubric_payroll WHERE id = ?;`;

  db.exec(sql, [req.params.id])
    .then((row) => {
    // if nothing happened, let the client know via a 404 error
      if (row.affectedRows === 0) {
        throw new NotFound(`Could not find a Rubric with id ${req.params.id}`);
      }

      res.status(204).json();
    })
    .catch(next)
    .done();
}

// get list of Rubric
exports.list = list;

// get details of a Rubric
exports.detail = detail;

// create a new Rubric
exports.create = create;

// update Rubric informations
exports.update = update;

// Delete a Rubric
exports.delete = del;