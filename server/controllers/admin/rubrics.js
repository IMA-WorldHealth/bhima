/**
* Rubric Controller
*
* This controller exposes an API to the client for reading and writing Rubric
*/

var db = require('../../lib/db');
var NotFound = require('../../lib/errors/NotFound');

// GET /Rubric
function lookupRubric(id) {
  var sql =`
    SELECT id, label, abbr, is_discount, is_percent, value, is_advance, is_social_care
    FROM rubric AS c
    WHERE c.id = ?`;

  return db.one(sql, [id]);
}


// Lists the Rubrics Payroll
function list(req, res, next) {
  const sql = `
    SELECT id, label, abbr, is_discount, is_percent, value, is_advance, is_social_care
    FROM rubric AS c
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
  const sql = `INSERT INTO rubric SET ?`;
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
  const sql = `UPDATE rubric SET ? WHERE id = ?;`;

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
  const sql = `DELETE FROM rubric WHERE id = ?;`;

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

// get list of rubric
exports.list = list;

// get details of a rubric
exports.detail = detail;

// create a new rubric
exports.create = create;

// update rubric informations
exports.update = update;

// Delete a rubric
exports.delete = del;