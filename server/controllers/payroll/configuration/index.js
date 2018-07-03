/**
* Payroll Configuration Controller
*
* This controller exposes an API to the client for reading and writing Payroll configuration
*/

const db = require('../../../lib/db');
const NotFound = require('../../../lib/errors/NotFound');

// GET /PAYROLL_CONFIG
function lookupPayrollConfig(id) {
  const sql = `
    SELECT p.id, p.label, p.dateFrom, p.dateTo, p.config_rubric_id, 
    p.config_accounting_id, p.config_weekend_id, p.config_ipr_id, p.config_employee_id
    FROM payroll_configuration AS p
    WHERE p.id = ?`;

  return db.one(sql, [id]);
}

// Lists the Payroll configurations
function list(req, res, next) {
  const sql = `
    SELECT p.id, p.label, p.dateFrom, p.dateTo, p.config_rubric_id, 
    p.config_accounting_id, p.config_weekend_id, p.config_ipr_id, p.config_employee_id
    FROM payroll_configuration AS p;`;

  db.exec(sql)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
* GET /PAYROLL_CONFIG/:ID
*
* Returns the detail of a single Payroll
*/
function detail(req, res, next) {
  const id = req.params.id;

  lookupPayrollConfig(id)
    .then((record) => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// POST /PAYROLL_CONFIG
function create(req, res, next) {
  const sql = `INSERT INTO payroll_configuration SET ?`;
  const data = req.body;

  db.exec(sql, [data])
    .then((row) => {
      res.status(201).json({ id : row.insertId });
    })
    .catch(next)
    .done();
}


// PUT /PAYROLL_CONFIG /:ID
function update(req, res, next) {
  const sql = `UPDATE payroll_configuration SET ? WHERE id = ?;`;

  db.exec(sql, [req.body, req.params.id])
    .then(() => {
      return lookupPayrollConfig(req.params.id);
    })
    .then((record) => {
    // all updates completed successfull, return full object to client
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// DELETE /PAYROLL_CONFIG /:ID
function del(req, res, next) {
  const sql = `DELETE FROM payroll_configuration WHERE id = ?;`;

  db.exec(sql, [req.params.id])
    .then((row) => {
    // if nothing happened, let the client know via a 404 error
      if (row.affectedRows === 0) {
        throw new NotFound(`Could not find a Payroll configuration with id ${req.params.id}`);
      }

      res.status(204).json();
    })
    .catch(next)
    .done();
}

function paiementStatus(req, res, next) {
  const sql = `
    SELECT paiement_status.id, paiement_status.text
    FROM paiement_status
  `;

  db.exec(sql)
    .then(rows => res.status(200).json(rows))
    .catch(next)
    .done();
}

// get list of Payroll configuration
exports.list = list;

// get details of a Payroll configuration
exports.detail = detail;

// create a new Payroll configuration
exports.create = create;

// update Payroll configurationinformations
exports.update = update;

// Delete a Payroll configuration
exports.delete = del;

// get list of Paiement Status
exports.paiementStatus = paiementStatus;

exports.lookupPayrollConfig = lookupPayrollConfig;
