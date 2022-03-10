/**
 * @method find
 *
 * @description
 * This method will apply filters from the options object passed in to
 * filter.
 */
const db = require('../../../lib/db');
const util = require('../../../lib/util');

// get staffing indice parameters
function detail(req, res, next) {
  const sql = `
    SELECT BUID(uuid) as uuid, pay_envelope, working_days, payroll_configuration_id
    FROM staffing_indice_parameters
    WHERE payroll_configuration_id =?
  `;
  const id = req.params.payroll_config_id;
  db.one(sql, id).then(param => {
    res.status(200).json(param);
  }).catch(next);
}

// settup staffing indice parameters
async function create(req, res, next) {
  const data = req.body;
  data.uuid = db.uuid();
  const id = req.body.payroll_configuration_id;

  const transaction = db.transaction();
  const minMonentaryUnit = req.session.enterprise.min_monentary_unit;
  const payEnvelope = req.body.pay_envelope;
  const workingDays = req.body.working_days;
  const requestsUpdateIndices = await stagePaymentIndice(id);

  const paymentIndice = requestsUpdateIndices[0];
  const employeesGradeIndice = requestsUpdateIndices[1];
  const aggregateOtherProfits = requestsUpdateIndices[2];
  const rubricMonetaryValue = requestsUpdateIndices[3];

  let totalCode = 0;
  let rubricPayRateId;
  let rubricGrossSallaryId;
  let rubricNumberOfDaysId;

  transaction.addQuery('DELETE FROM staffing_indice_parameters WHERE payroll_configuration_id =?', id);
  transaction.addQuery('INSERT INTO staffing_indice_parameters SET ?', data);

  const updateStaffingIndice = `
    UPDATE stage_payment_indice SET rubric_value = ?
    WHERE payroll_configuration_id = ? AND employee_uuid = ? AND rubric_id = ?;
  `;

  const updateEmployeeIndividualySalary = `
    UPDATE employee SET individual_salary = ? WHERE uuid = ?
  `;

  employeesGradeIndice.forEach(emp => {
    let totalDays = 0;
    let rubricTotalDaysId;
    let rubricReagisteredIndexId;
    let rubricTotalCodeId;
    let rubricDayIndexId;

    emp.totalBase = 0;

    transaction.addQuery(`DELETE FROM employee_advantage WHERE employee_uuid = ?`, [emp.employee_buid]);

    paymentIndice.forEach(ind => {
      if (emp.employee_uuid === ind.employee_uuid) {
        // Calcul Total days for rubrics where type is 'is_day_worked' and 'is_extra_day'
        if (ind.indice_type === 'is_day_worked' || ind.indice_type === 'is_extra_day') {
          totalDays += ind.rubric_value;
        }

        // Get Total Days Rubric Id
        if (ind.indice_type === 'is_total_days') {
          rubricTotalDaysId = ind.rubric_id;
        }

        // Get Reagistered Index Rubric Id
        if (ind.indice_type === 'is_reagistered_index') {
          rubricReagisteredIndexId = ind.rubric_id;
        }

        // Get Total code Rubric Id
        if (ind.indice_type === 'is_total_code') {
          rubricTotalCodeId = ind.rubric_id;
        }

        // Get is base index
        if (ind.indice_type === 'is_base_index') {
          ind.rubric_value = emp.grade_indice;
          emp.totalBase += emp.grade_indice;
          transaction.addQuery(updateStaffingIndice, [emp.grade_indice, id, emp.employee_buid, ind.rubric_id]);
        }

        // Get is responsability
        if (ind.indice_type === 'is_responsability') {
          ind.rubric_value = emp.function_indice;
          emp.totalBase += emp.function_indice;
          transaction.addQuery(
            updateStaffingIndice,
            [emp.function_indice, id, emp.employee_buid, ind.rubric_id],
          );
        }

        // Get Pay Rate Id
        if (ind.indice_type === 'is_pay_rate') {
          rubricPayRateId = ind.rubric_id;
        }

        // Get Gross Sallary Id
        if (ind.indice_type === 'is_gross_salary') {
          rubricGrossSallaryId = ind.rubric_id;
        }

        // Get Number of days ID
        if (ind.indice_type === 'is_number_of_days') {
          rubricNumberOfDaysId = ind.rubric_id;
        }

        // Get is other responsability
        if (ind.indice_type === 'is_other_responsability') {
          emp.totalBase += ind.rubric_value;
        }

        // Get Day Index Id
        if (ind.indice_type === 'is_day_index') {
          rubricDayIndexId = ind.rubric_id;
        }
      }
    });

    rubricMonetaryValue.forEach(money => {
      if (emp.employee_uuid === money.employee_uuid) {
        transaction.addQuery('INSERT INTO employee_advantage SET ?', {
          employee_uuid : emp.employee_buid,
          rubric_payroll_id : money.rubric_id,
          value : money.rubric_value,
        });
      }
    });

    aggregateOtherProfits.forEach(profit => {
      if (emp.employee_uuid === profit.employee_uuid) {
        emp.otherProfits = profit.rubric_value;
      }
    });

    emp.dayIndex = (emp.totalBase / workingDays) || 0;
    emp.numberOfDays = workingDays;
    emp.totalDays = totalDays;
    emp.indiceReajust = util.roundDecimal((emp.dayIndex * totalDays), 5);
    emp.totalCode = emp.indiceReajust + emp.otherProfits;

    // Set Total days
    transaction.addQuery(updateStaffingIndice, [totalDays, id, emp.employee_buid, rubricTotalDaysId]);

    // Set Reagistered Index
    transaction.addQuery(
      updateStaffingIndice,
      [emp.indiceReajust, id, emp.employee_buid, rubricReagisteredIndexId],
    );

    // Set Total Code
    transaction.addQuery(
      updateStaffingIndice,
      [emp.totalCode, id, emp.employee_buid, rubricTotalCodeId],
    );

    // Set Day index
    transaction.addQuery(
      updateStaffingIndice,
      [emp.dayIndex, id, emp.employee_buid, rubricDayIndexId],
    );

    totalCode += emp.totalCode;
  });

  const payRate = payEnvelope / totalCode;

  employeesGradeIndice.forEach(emp => {
    emp.payRate = payRate;
    emp.grossSalary = util.roundDecimal(((payRate * emp.totalCode) / minMonentaryUnit), 0) * minMonentaryUnit;

    // Set Pay Rate
    transaction.addQuery(
      updateStaffingIndice,
      [payRate, id, emp.employee_buid, rubricPayRateId],
    );

    // Set Gross Sallary
    transaction.addQuery(
      updateStaffingIndice,
      [emp.grossSalary, id, emp.employee_buid, rubricGrossSallaryId],
    );

    // Update Individualy salary for Payroll Process
    transaction.addQuery(
      updateEmployeeIndividualySalary,
      [emp.grossSalary, emp.employee_buid],
    );

    // Set working days
    transaction.addQuery(
      updateStaffingIndice,
      [workingDays, id, emp.employee_buid, rubricNumberOfDaysId],
    );
  });

  transaction.execute().then(() => {
    res.sendStatus(201);
  }).catch(next);
}

async function stagePaymentIndice(payrollConfigurationId) {

  const sqlGetStagePaymentIndice = `
    SELECT BUID(spi.employee_uuid) AS employee_uuid, rub.id AS rubric_id, rub.label,
    rub.label, spi.rubric_value, rub.indice_type
    FROM stage_payment_indice AS spi
    JOIN rubric_payroll AS rub ON rub.id = spi.rubric_id
    WHERE spi.payroll_configuration_id = ? AND rub.is_indice = 1 AND rub.is_monetary_value = 0;
  `;

  const sqlGetEmployees = `
    SELECT BUID(cei.employee_uuid) AS employee_uuid, cei.employee_uuid AS employee_buid,
    ind.grade_indice, ind.function_indice
    FROM payroll_configuration pc
    JOIN config_employee ce ON ce.id = pc.config_employee_id
    JOIN config_employee_item cei ON cei.config_employee_id = ce.id
    JOIN (
    SELECT ind.uuid, ind.employee_uuid, ind.grade_indice, ind.function_indice, MAX(ind.date) AS last_date
     FROM staffing_indice AS ind
     GROUP BY ind.employee_uuid
    ) ind ON ind.employee_uuid = cei.employee_uuid
     WHERE pc.id = ?;
  `;

  const sqlGetAggregateOtherProfits = `
    SELECT BUID(spi.employee_uuid) AS employee_uuid, SUM(spi.rubric_value) AS rubric_value,
    rub.indice_type, spi.rubric_id, spi.payroll_configuration_id
    FROM stage_payment_indice AS spi
    JOIN rubric_payroll AS rub ON rub.id = spi.rubric_id
    WHERE spi.payroll_configuration_id = ? AND rub.is_indice = 1 AND rub.is_monetary_value = 0
    AND rub.indice_type = 'is_other_profits'
    GROUP BY spi.employee_uuid;  
  `;

  const sqlGetRubricMonetaryValue = `
    SELECT BUID(spi.employee_uuid) AS employee_uuid, rub.id AS rubric_id, rub.label,
    rub.label, spi.rubric_value, rub.indice_type
    FROM stage_payment_indice AS spi
    JOIN rubric_payroll AS rub ON rub.id = spi.rubric_id
    WHERE spi.payroll_configuration_id = ? AND rub.is_indice = 1 AND rub.is_monetary_value = 1;
  `;

  return Promise.all([
    db.exec(sqlGetStagePaymentIndice, [payrollConfigurationId]),
    db.exec(sqlGetEmployees, [payrollConfigurationId]),
    db.exec(sqlGetAggregateOtherProfits, [payrollConfigurationId]),
    db.exec(sqlGetRubricMonetaryValue, [payrollConfigurationId]),
  ]);

}

module.exports.detail = detail;
module.exports.create = create;
