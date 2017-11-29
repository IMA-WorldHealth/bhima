/**
* Tax Controller
*
* This controller exposes an API to the client for reading and writing Tax
*/

var db = require('../../lib/db');
var NotFound = require('../../lib/errors/NotFound');

// GET /Tax
function lookupTax(id) {
  var sql =`
    SELECT t.id, t.label, t.abbr, t.is_employee, t.is_percent, 
    t.four_account_id, t.six_account_id, t.value, t.is_ipr 
    FROM tax AS t  
    WHERE t.id = ?`;

  return db.one(sql, [id]);
}

// Lists the Payroll Taxes
function list(req, res, next) {
  const sql = `
    SELECT t.id, t.label, t.abbr, t.is_employee, t.is_percent, 
    t.four_account_id, a4.number AS four_number, a4.label AS four_label, 
    t.six_account_id, a6.number AS six_number, a6.label AS six_label, t.value, t.is_ipr
    FROM tax AS t
    JOIN account AS a4 ON a4.id = t.four_account_id
    JOIN account AS a6 ON a6.id = t.six_account_id
  ;`;

  db.exec(sql)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
* GET /Tax/:ID
*
* Returns the detail of a single Tax
*/
function detail(req, res, next) {
  var id = req.params.id;

  lookupTax(id)
    .then((record) => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// POST /Tax
function create(req, res, next) {
  const sql = `INSERT INTO tax SET ?`;
  const data = req.body;

  db.exec(sql, [data])
    .then((row) => {
      res.status(201).json({ id : row.insertId });
    })
    .catch(next)
    .done();
}


// PUT /Tax /:id
function update(req, res, next) {
  const sql = `UPDATE tax SET ? WHERE id = ?;`;

  db.exec(sql, [req.body, req.params.id])
    .then(() => {
      return lookupTax(req.params.id);
    })
    .then((record) => {
    // all updates completed successfull, return full object to client
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// DELETE /Tax/:id
function del(req, res, next) {
  const sql = `DELETE FROM tax WHERE id = ?;`;

  db.exec(sql, [req.params.id])
    .then((row) => {
    // if nothing happened, let the client know via a 404 error
      if (row.affectedRows === 0) {
        throw new NotFound(`Could not find a Tax with id ${req.params.id}`);
      }

      res.status(204).json();
    })
    .catch(next)
    .done();
}

// get list of Tax
exports.list = list;

// get details of a Tax
exports.detail = detail;

// create a new Tax
exports.create = create;

// update Tax informations
exports.update = update;

// Delete a Tax
exports.delete = del;