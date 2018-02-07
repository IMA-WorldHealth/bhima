/**
* Account Controller
*
* This controller exposes an API to the client for reading and writing Account
*/

var db = require('../../../lib/db');
var NotFound = require('../../../lib/errors/NotFound');

// GET /ACCOUNT_CONFIG
function lookupAccountConfig(id) {
  var sql =`
    SELECT c.id, c.label, c.account_id
    FROM config_accounting AS c  
    WHERE c.id = ?`;

  return db.one(sql, [id]);
}

// Lists the Payroll Accounts Configurations
function list(req, res, next) {
  const sql = `
    SELECT c.id, c.label, c.account_id, a.number AS account_number, a.label AS account_label
    FROM config_accounting AS c
    JOIN account AS a ON a.id = c.account_id
  ;`;

  db.exec(sql)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
* GET /ACCOUNT_CONFIG/:ID
*
* Returns the detail of a single Account
*/
function detail(req, res, next) {
  var id = req.params.id;

  lookupAccountConfig(id)
    .then((record) => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// POST /ACCOUNT_CONFIG
function create(req, res, next) {
  const sql = `INSERT INTO config_accounting SET ?`;
  const data = req.body;

  db.exec(sql, [data])
    .then((row) => {
      res.status(201).json({ id : row.insertId });
    })
    .catch(next)
    .done();
}


// PUT /ACCOUNT_CONFIG /:ID
function update(req, res, next) {
  const sql = `UPDATE config_accounting SET ? WHERE id = ?;`;

  db.exec(sql, [req.body, req.params.id])
    .then(() => {
      return lookupAccountConfig(req.params.id);
    })
    .then((record) => {
    // all updates completed successfull, return full object to client
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// DELETE /ACCOUNT_CONFIG /:ID
function del(req, res, next) {
  const sql = `DELETE FROM config_accounting WHERE id = ?;`;

  db.exec(sql, [req.params.id])
    .then((row) => {
    // if nothing happened, let the client know via a 404 error
      if (row.affectedRows === 0) {
        throw new NotFound(`Could not find a Account Configuration with id ${req.params.id}`);
      }

      res.status(204).json();
    })
    .catch(next)
    .done();
}

// get list of Account
exports.list = list;

// get details of a Account
exports.detail = detail;

// create a new Account
exports.create = create;

// update Account informations
exports.update = update;

// Delete a Account
exports.delete = del;
