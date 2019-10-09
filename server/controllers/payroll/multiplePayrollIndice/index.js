/**
 * @method find
 *
 * @description
 * This method will apply filters from the options object passed in to
 * filter.
 */
const db = require('../../../lib/db');

exports.read = read;
exports.create = create;
exports.lookUp = lookUp;
exports.parameters = require('./paramter.config');
exports.reports = require('./report');


// retrieve indice's value for employee(s)
async function read(req, res, next) {
  lookUp(req.query).then(rows => {
    res.status(200).json(rows);
  }).catch(next);
}

// specfiying indice's value for an employee
function create(req, res, next) {
  const currencyId = req.body.currency_id;
  const payrollConfigurationId = req.body.payroll_configuration_id;
  const employeeUuid = req.body.employee_uuid;
  const { rubrics } = req.body;

  const monataryRubrics = rubrics.filter(r => {
    return r.is_monetary === 1;
  });

  const transaction = db.transaction();
  transaction.addQuery(`DELETE FROM employee_advantage WHERE employee_uuid = ?`, [db.bid(employeeUuid)]);

  monataryRubrics.forEach(r => {
    transaction.addQuery('INSERT INTO employee_advantage SET ?', {
      employee_uuid : db.bid(employeeUuid),
      rubric_payroll_id : r.id,
      value : r.value,
    });
  });

  rubrics.forEach(r => {
    transaction.addQuery(`
      DELETE FROM stage_payment_indice 
      WHERE employee_uuid = ? AND payroll_configuration_id=? AND rubric_id = ?`, [
      db.bid(employeeUuid), payrollConfigurationId, r.id]);

    transaction.addQuery('INSERT INTO stage_payment_indice SET ?', {
      uuid : db.uuid(),
      employee_uuid : db.bid(employeeUuid),
      payroll_configuration_id : payrollConfigurationId,
      rubric_id : r.id,
      currency_id : currencyId,
      rubric_value : r.value,
    });
  });

  transaction.execute().then(() => {
    res.sendStatus(201);
  }).catch(next);
}


// retrieve indice's value for employee(s)
async function lookUp(options) {

  const payConfigId = options.payroll_configuration_id;
  const employeeUuid = options.employee_uuid;

  const employeSql = `
    SELECT BUID(emp.uuid) as uuid,UPPER(pt.display_name) AS display_name, pt.sex
    FROM payroll_configuration pc
    JOIN config_employee ce ON ce.id = pc.config_employee_id
    JOIN config_employee_item cei ON cei.config_employee_id = ce.id
    JOIN employee emp ON emp.uuid = cei.employee_uuid
    JOIN patient pt ON pt.uuid = emp.patient_uuid
    WHERE pc.id = ? 
    ${employeeUuid ? ` AND emp.uuid = ?` : ''}
  `;

  const stagePaymentIndiceSql = `
    SELECT rubric_id, rubric_value, rb.abbr as rubric_abbr,  BUID(sti.employee_uuid) as employee_uuid
    FROM stage_payment_indice sti
    JOIN employee emp ON emp.uuid = sti.employee_uuid
    JOIN rubric_payroll rb ON rb.id = sti.rubric_id
    WHERE sti.payroll_configuration_id = ? 
    ${employeeUuid ? ` AND emp.uuid = ?` : ''}
  `;

  const rubricSql = `
    SELECT rb.* 
    FROM rubric_payroll rb
    JOIN config_rubric_item cti ON cti.rubric_payroll_id = rb.id
    JOIN config_rubric cr On cr.id = cti.config_rubric_id
    WHERE
      cr.id IN ( SELECT config_rubric_id FROM payroll_configuration WHERE id = ?)
      AND rb.is_indice = 1
    
    ORDER BY rb.position
  `;

  // let get enterprise employees
  const employeeParams = [payConfigId];
  if (employeeUuid) {
    employeeParams.push(db.bid(employeeUuid));
  }

  const employees = await db.exec(employeSql, employeeParams);
  const employeesMap = {};
  employees.forEach(employee => {
    employeesMap[employee.uuid] = employee;
    employeesMap[employee.uuid].rubrics = [];
  });

  // let get rubric values for each employee
  const stagePaymentsParams = employeeUuid ? [payConfigId, db.bid(employeeUuid)] : [payConfigId];
  const stagePayments = await db.exec(stagePaymentIndiceSql, stagePaymentsParams);
  stagePayments.forEach(stagePay => {
    employeesMap[stagePay.employee_uuid].rubrics.push(stagePay);
  });

  // let get rubric for this payment period
  const rubrics = await db.exec(rubricSql, payConfigId);

  return { employees, rubrics };
}
