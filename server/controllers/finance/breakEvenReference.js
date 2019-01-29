/**
* Break Even Reference Controller
*
* This controller exposes an API to the client for reading and writing Break Even Reference
*/

const db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');

// GET /break_even_reference
function lookupBreakEvenReference(id) {
  const sql = `
    SELECT id, label, is_cost, is_variable, is_turnover, account_reference_id FROM break_even_reference
    WHERE break_even_reference.id = ?`;

  return db.one(sql, [id]);
}

// List
function list(req, res, next) {
  const sql = `
    SELECT br.id, br.label, br.is_cost, br.is_variable, is_turnover, br.account_reference_id,
    ar.abbr 
    FROM break_even_reference AS br
    JOIN account_reference AS ar ON ar.id = br.account_reference_id
    ORDER BY br.label ASC;
  `;

  db.exec(sql)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
* GET /break_even_reference/:ID
*
* Returns the detail of a single break_even_reference
*/
function detail(req, res, next) {
  const { id } = req.params;

  lookupBreakEvenReference(id)
    .then((record) => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}


// POST /break_even_reference
function create(req, res, next) {
  const sql = `INSERT INTO break_even_reference SET ?`;
  const data = req.body;

  db.exec(sql, [data])
    .then((row) => {
      res.status(201).json({ id : row.insertId });
    })
    .catch(next)
    .done();
}


// PUT /break_even_reference /:id
function update(req, res, next) {
  const sql = `UPDATE break_even_reference SET ? WHERE id = ?;`;

  db.exec(sql, [req.body, req.params.id])
    .then(() => {
      return lookupBreakEvenReference(req.params.id);
    })
    .then((record) => {
    // all updates completed successfull, return full object to client
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// DELETE /break_even_reference/:id
function remove(req, res, next) {
  const sql = `DELETE FROM break_even_reference WHERE id = ?;`;

  db.exec(sql, [req.params.id])
    .then((row) => {
    // if nothing happened, let the client know via a 404 error
      if (row.affectedRows === 0) {
        throw new NotFound(`Could not find a function with id ${req.params.id}`);
      }

      res.status(204).json();
    })
    .catch(next)
    .done();
}

// get list of breakEvenReference
exports.list = list;

// get details of a breakEvenReference
exports.detail = detail;

// create a new breakEvenReference
exports.create = create;

// update breakEvenReference informations
exports.update = update;

// Delete a breakEvenReference
exports.delete = remove;
