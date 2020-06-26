/**
* Payroll Configuration Controller
*
* This controller exposes an API to the client for reading and writing Payroll configuration
*/

const q = require('q');
const db = require('../../../lib/db');

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
    FROM payroll_configuration AS p
    ORDER BY p.dateTo DESC;`;

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
  lookupPayrollConfig(req.params.id)
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
  let insertedId = null;
  db.exec(sql, [data])
    .then((row) => {
      insertedId = row.insertId;
      return db.exec(`CALL UpdateStaffingIndices(?, ?)`, [data.dateFrom, data.dateTo]);
    }).then(() => {
      res.status(201).json({ id : insertedId });
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
  db.delete(
    'payroll_configuration', 'id', req.params.id, res, next,
    `Could not find a Payroll configuration with id ${req.params.id}`,
  );
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

/*
  * This function returns
  * Payroll rubrics configured for a pay period based on a list of employees
  * The status of the employee report that was on vacation during the pay period
  * The status of the holiday payments report
  * The summation of the rubrics configured for all employees
  * The summation of the expenses of the employees
  * The summation of the rubrics in the expenses of the company
*/
function payrollReportElements(idPeriod, employees, employeesPaiementUuid) {
  const sql = `
    SELECT rubric_paiement.paiement_uuid, rubric_paiement.value AS result,
    BUID(paiement.employee_uuid) AS employee_uuid, rubric_payroll.abbr, UPPER(rubric_payroll.label) AS label,
    rubric_payroll.is_percent, rubric_payroll.value, rubric_payroll.is_discount,
    rubric_payroll.is_social_care, rubric_payroll.is_employee, paiement.currency_id
    FROM rubric_paiement
    JOIN paiement ON paiement.uuid = rubric_paiement.paiement_uuid
    JOIN employee ON employee.uuid = paiement.employee_uuid
    JOIN rubric_payroll ON rubric_payroll.id = rubric_paiement.rubric_payroll_id
    WHERE paiement.payroll_configuration_id = ? AND employee.uuid IN (?)
    AND rubric_payroll.is_monetary_value = 1
    ORDER BY rubric_payroll.label, rubric_payroll.is_social_care ASC, rubric_payroll.is_discount ASC
  `;

  const sqlHolidayPaiement = `
    SELECT holiday_paiement.holiday_nbdays, holiday_paiement.holiday_nbdays, holiday_paiement.holiday_percentage,
    holiday_paiement.label, holiday_paiement.value, BUID(holiday_paiement.paiement_uuid) AS paiement_uuid
    FROM holiday_paiement
    WHERE holiday_paiement.paiement_uuid IN (?)
  `;

  const sqlOffDayPaiement = `
    SELECT offday_paiement.offday_percentage, BUID(offday_paiement.paiement_uuid) AS paiement_uuid,
    offday_paiement.label, offday_paiement.value
    FROM offday_paiement
    WHERE offday_paiement.paiement_uuid IN (?)
  `;

  const getRubricPayrollEmployee = `
    SELECT config_rubric_item.id, config_rubric_item.config_rubric_id, config_rubric_item.rubric_payroll_id,
    payroll_configuration.label AS PayrollConfig, rubric_payroll.*
    FROM config_rubric_item
    JOIN rubric_payroll ON rubric_payroll.id = config_rubric_item.rubric_payroll_id
    JOIN payroll_configuration ON payroll_configuration.config_rubric_id = config_rubric_item.config_rubric_id
    WHERE payroll_configuration.id = ?
    AND (rubric_payroll.is_discount = 0 OR (rubric_payroll.is_discount = 1 AND rubric_payroll.is_employee = 1))
    ORDER BY rubric_payroll.is_employee ASC, rubric_payroll.is_social_care ASC, rubric_payroll.is_discount ASC,
    rubric_payroll.label ASC;
  `;

  const getRubricPayrollEnterprise = `
    SELECT config_rubric_item.id, config_rubric_item.config_rubric_id, config_rubric_item.rubric_payroll_id,
    payroll_configuration.label AS PayrollConfig, rubric_payroll.*
    FROM config_rubric_item
    JOIN rubric_payroll ON rubric_payroll.id = config_rubric_item.rubric_payroll_id
    JOIN payroll_configuration ON payroll_configuration.config_rubric_id = config_rubric_item.config_rubric_id
    WHERE payroll_configuration.id = ?
    AND (rubric_payroll.is_discount = 1 AND rubric_payroll.is_employee = 0)
    ORDER BY rubric_payroll.is_employee ASC, rubric_payroll.is_social_care ASC, rubric_payroll.is_discount ASC,
    rubric_payroll.label ASC;
  `;

  return q.all([
    db.exec(sql, [idPeriod, employees]),
    db.exec(sqlHolidayPaiement, [employeesPaiementUuid]),
    db.exec(sqlOffDayPaiement, [employeesPaiementUuid]),
    db.exec(getRubricPayrollEmployee, [idPeriod]),
    db.exec(getRubricPayrollEnterprise, [idPeriod]),
  ]);
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

exports.payrollReportElements = payrollReportElements;
