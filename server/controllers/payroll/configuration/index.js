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
      return db.exec(`CALL UpdateStaffingIndices(?, ?, ?)`, [data.dateFrom, data.dateTo, insertedId]);
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

function paymentStatus(req, res, next) {
  const sql = `
    SELECT payment_status.id, payment_status.text
    FROM payment_status
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
function payrollReportElements(idPeriod, employees, employeesPaymentUuid) {
  const sql = `
    SELECT rubric_payment.payment_uuid, rubric_payment.value AS result,
    BUID(payment.employee_uuid) AS employee_uuid, rubric_payroll.abbr, UPPER(rubric_payroll.label) AS label,
    rubric_payroll.is_percent, rubric_payroll.value, rubric_payroll.is_discount,
    rubric_payroll.is_social_care, rubric_payroll.is_employee, payment.currency_id
    FROM rubric_payment
    JOIN payment ON payment.uuid = rubric_payment.payment_uuid
    JOIN employee ON employee.uuid = payment.employee_uuid
    JOIN rubric_payroll ON rubric_payroll.id = rubric_payment.rubric_payroll_id
    WHERE payment.payroll_configuration_id = ? AND employee.uuid IN (?)
    AND rubric_payroll.is_monetary_value = 1
    ORDER BY rubric_payroll.label, rubric_payroll.is_social_care ASC, rubric_payroll.is_discount ASC
  `;

  const sqlHolidayPayment = `
    SELECT holiday_payment.holiday_nbdays, holiday_payment.holiday_nbdays, holiday_payment.holiday_percentage,
    holiday_payment.label, holiday_payment.value, BUID(holiday_payment.payment_uuid) AS payment_uuid
    FROM holiday_payment
    WHERE holiday_payment.payment_uuid IN (?)
  `;

  const sqlOffDayPayment = `
    SELECT offday_payment.offday_percentage, BUID(offday_payment.payment_uuid) AS payment_uuid,
    offday_payment.label, offday_payment.value
    FROM offday_payment
    WHERE offday_payment.payment_uuid IN (?)
  `;

  const getRubricPayrollEmployee = `
    SELECT config_rubric_item.id, config_rubric_item.config_rubric_id, config_rubric_item.rubric_payroll_id,
    payroll_configuration.label AS PayrollConfig, rubric_payroll.*
    FROM config_rubric_item
    JOIN rubric_payroll ON rubric_payroll.id = config_rubric_item.rubric_payroll_id
    JOIN payroll_configuration ON payroll_configuration.config_rubric_id = config_rubric_item.config_rubric_id
    WHERE payroll_configuration.id = ?
    AND (rubric_payroll.is_discount = 0 OR (rubric_payroll.is_discount = 1 AND rubric_payroll.is_employee = 1))
    AND rubric_payroll.is_monetary_value = 1
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
    AND rubric_payroll.is_monetary_value = 1
    ORDER BY rubric_payroll.is_employee ASC, rubric_payroll.is_social_care ASC, rubric_payroll.is_discount ASC,
    rubric_payroll.label ASC;
  `;

  const sqlRubricPayrollIndice = `
    SELECT spi.employee_uuid, spi.payroll_configuration_id, spi.rubric_id, spi.rubric_value,
    rub.is_indice, rub.is_monetary_value, rub.label AS rubric_label, rub.indice_type
    FROM stage_payment_indice AS spi
    JOIN rubric_payroll AS rub ON rub.id = spi.rubric_id
    WHERE spi.payroll_configuration_id = ? AND spi.employee_uuid IN (?)
    AND rub.is_indice = 1 AND rub.is_monetary_value = 0
    ORDER BY rub.label ASC;
  `;

  return q.all([
    db.exec(sql, [idPeriod, employees]),
    db.exec(sqlHolidayPayment, [employeesPaymentUuid]),
    db.exec(sqlOffDayPayment, [employeesPaymentUuid]),
    db.exec(getRubricPayrollEmployee, [idPeriod]),
    db.exec(getRubricPayrollEnterprise, [idPeriod]),
    db.exec(sqlRubricPayrollIndice, [idPeriod, employees]),
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

// get list of Payment Status
exports.paymentStatus = paymentStatus;

exports.lookupPayrollConfig = lookupPayrollConfig;

exports.payrollReportElements = payrollReportElements;
