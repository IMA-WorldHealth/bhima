/**
* Cotisation Controller
*
* This controller exposes an API to the client for reading and writing Cotisation
*/

var db = require('../../lib/db');
var NotFound = require('../../lib/errors/NotFound');

// GET /Cotisation
function lookupCotisation(id) {
  var sql =`
    SELECT c.id, c.label, c.abbr, c.is_employee, c.is_percent, 
    c.four_account_id, c.six_account_id, c.value 
    FROM cotisation AS c  
    WHERE c.id = ?`;

  return db.one(sql, [id]);
}


// Lists the functions of hospital employees
function list(req, res, next) {
  const sql = `
    SELECT c.id, c.label, c.abbr, c.is_employee, c.is_percent, 
    c.four_account_id, a4.number AS four_number, a4.label AS four_label, 
    c.six_account_id, a6.number AS six_number, a6.label AS six_label, c.value 
    FROM cotisation AS c
    JOIN account AS a4 ON a4.id = c.four_account_id
    JOIN account AS a6 ON a6.id = c.six_account_id   
  ;`;

  db.exec(sql)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
* GET /Cotisation/:ID
*
* Returns the detail of a single Cotisation
*/
function detail(req, res, next) {
  var id = req.params.id;

  lookupCotisation(id)
    .then((record) => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// POST /Cotisation
function create(req, res, next) {
  const sql = `INSERT INTO cotisation SET ?`;
  const data = req.body;

  db.exec(sql, [data])
    .then((row) => {
      res.status(201).json({ id : row.insertId });
    })
    .catch(next)
    .done();
}


// PUT /Cotisation /:id
function update(req, res, next) {
  const sql = `UPDATE cotisation SET ? WHERE id = ?;`;

  db.exec(sql, [req.body, req.params.id])
    .then(() => {
      return lookupCotisation(req.params.id);
    })
    .then((record) => {
    // all updates completed successfull, return full object to client
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// DELETE /function/:id
function del(req, res, next) {
  const sql = `DELETE FROM cotisation WHERE id = ?;`;

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

// get list of function
exports.list = list;

// get details of a function
exports.detail = detail;

// create a new function
exports.create = create;

// update function informations
exports.update = update;

// Delete a function
exports.delete = del;
