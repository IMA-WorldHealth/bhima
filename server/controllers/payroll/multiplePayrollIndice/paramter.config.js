/**
 * @method find
 *
 * @description
 * This method will apply filters from the options object passed in to
 * filter.
 */
const moment = require('moment');
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
  const percentageFixedBonus = req.session.enterprise.settings.percentage_fixed_bonus;
  const percentagePerformanceBonus = 100 - percentageFixedBonus;

  const payEnvelope = req.body.pay_envelope * (percentageFixedBonus / 100);
  const bonusPerformance = req.body.pay_envelope * (percentagePerformanceBonus / 100);

  const workingDays = req.body.working_days;
  const requestsUpdateIndices = await stagePaymentIndice(id);

  const paymentIndice = requestsUpdateIndices[0];
  const employeesGradeIndice = requestsUpdateIndices[1];
  const aggregateOtherProfits = requestsUpdateIndices[2];
  const rubricMonetaryValue = requestsUpdateIndices[3];
  const payrollPeriod = requestsUpdateIndices[4];
  const payrollPeriodDate = payrollPeriod[0].dateTo;

  let totalCode = 0;
  let rubricPayRateId;
  let rubricGrossSallaryId;
  let rubricNumberOfDaysId;
  let rubricFixedBonusId;
  let totalRelatifPoint = 0;
  let rubricPerformanceRateId;
  let rubricPerformanceBonusId;

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

    const diff = moment(payrollPeriodDate).diff(moment(emp.date_embauche));
    const duration = moment.duration(diff, 'milliseconds');
    const yearOfSeniority = parseInt(duration.asYears(), 10);

    emp.totalBase = 0;

    transaction.addQuery(`DELETE FROM employee_advantage WHERE employee_uuid = ?`, [emp.employee_buid]);

    const employeePaymentIndice = paymentIndice.filter(ind => ind.employee_uuid === emp.employee_uuid);

    employeePaymentIndice.forEach(ind => {
      // Calcul Total days for rubrics where type is 'is_day_worked' Or 'is_extra_day'
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
        if (ind.rubric_id) {
          transaction.addQuery(updateStaffingIndice, [emp.grade_indice, id, emp.employee_buid, ind.rubric_id]);
        }
      }

      // Get is responsability
      if (ind.indice_type === 'is_responsability') {
        ind.rubric_value = emp.function_indice;
        emp.totalBase += emp.function_indice;
        if (ind.rubric_id) {
          transaction.addQuery(
            updateStaffingIndice,
            [emp.function_indice, id, emp.employee_buid, ind.rubric_id],
          );
        }
      }

      // Get is seniority Bonus
      if (ind.indice_type === 'is_seniority_index') {
        ind.rubric_value = yearOfSeniority;
        emp.totalBase += yearOfSeniority;
        if (ind.rubric_id) {
          transaction.addQuery(
            updateStaffingIndice,
            [yearOfSeniority, id, emp.employee_buid, ind.rubric_id],
          );
        }
      }

      //  get Relative point
      if (ind.indice_type === 'is_individual_performance') {
        emp.performance = ind.rubric_value / 100;
      }

      // Get Pay Rate Id
      if (ind.indice_type === 'is_pay_rate') {
        rubricPayRateId = ind.rubric_id;
      }

      // Get Gross Sallary Id
      if (ind.indice_type === 'is_gross_salary') {
        rubricGrossSallaryId = ind.rubric_id;
      }

      // Get Fixed Bonus Id
      if (ind.indice_type === 'is_fixed_bonus') {
        rubricFixedBonusId = ind.rubric_id;
      }

      // Get Performance Bonus Id
      if (ind.indice_type === 'is_performance_bonus') {
        rubricPerformanceBonusId = ind.rubric_id;
      }

      // Get Number of days ID
      if (ind.indice_type === 'is_number_of_days') {
        rubricNumberOfDaysId = ind.rubric_id;
      }

      // Get Performance Bonus ID
      if (ind.indice_type === 'is_performance_rate') {
        rubricPerformanceRateId = ind.rubric_id;
      }

      // Get is other responsability
      if (ind.indice_type === 'is_other_responsability') {
        emp.totalBase += ind.rubric_value;
      }

      // Get Day Index Id
      if (ind.indice_type === 'is_day_index') {
        rubricDayIndexId = ind.rubric_id;
      }
    });

    employeePaymentIndice.forEach(ind => {
      // Save relative point
      if (ind.indice_type === 'is_relative_point') {
        if (ind.rubric_id) {
          transaction.addQuery(
            updateStaffingIndice,
            [(emp.totalBase * emp.performance), id, emp.employee_buid, ind.rubric_id],
          );
          emp.relatifPoint = emp.totalBase * emp.performance;
          totalRelatifPoint += emp.totalBase * emp.performance;
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

    emp.otherProfits = emp.otherProfits || 0;

    if (workingDays && totalDays) {
      emp.dayIndex = (emp.totalBase / workingDays) || 0;
      emp.numberOfDays = workingDays;
      emp.totalDays = totalDays;
      emp.indiceReajust = util.roundDecimal((emp.dayIndex * totalDays), 5);
      emp.totalCode = emp.indiceReajust + emp.otherProfits;
    } else {
      emp.totalCode = emp.totalBase + emp.otherProfits;
    }

    // Set Total days
    transaction.addQuery(updateStaffingIndice, [totalDays, id, emp.employee_buid, rubricTotalDaysId]);

    // Set Reagistered Index
    if (rubricReagisteredIndexId) {
      transaction.addQuery(
        updateStaffingIndice,
        [emp.indiceReajust, id, emp.employee_buid, rubricReagisteredIndexId],
      );
    }

    // Set Total Code
    if (rubricTotalCodeId) {
      transaction.addQuery(
        updateStaffingIndice,
        [emp.totalCode, id, emp.employee_buid, rubricTotalCodeId],
      );
    }

    // Set Day index
    if (rubricDayIndexId) {
      transaction.addQuery(
        updateStaffingIndice,
        [emp.dayIndex, id, emp.employee_buid, rubricDayIndexId],
      );
    }

    totalCode += emp.totalCode;
  });

  const payRate = payEnvelope / totalCode;
  const performanceBonusRate = bonusPerformance / totalRelatifPoint;

  employeesGradeIndice.forEach(emp => {
    emp.performanceBonus = 0;

    emp.payRate = payRate;
    emp.fixedBonus = util.roundDecimal(((payRate * emp.totalCode) / minMonentaryUnit), 0) * minMonentaryUnit;

    if (emp.relatifPoint) {
      emp.performanceBonus = performanceBonusRate * emp.relatifPoint;
    }

    emp.grossSalary = emp.fixedBonus + emp.performanceBonus;

    // Set Pay Rate
    if (rubricPayRateId) {
      transaction.addQuery(
        updateStaffingIndice,
        [payRate, id, emp.employee_buid, rubricPayRateId],
      );
    }

    // Set Employee Fixed Bonus
    if (rubricFixedBonusId) {
      transaction.addQuery(
        updateStaffingIndice,
        [emp.grossSalary, id, emp.employee_buid, rubricFixedBonusId],
      );
    }

    // Set Employee Performance Bonus
    if (rubricPerformanceBonusId) {
      transaction.addQuery(
        updateStaffingIndice,
        [emp.performanceBonus, id, emp.employee_buid, rubricPerformanceBonusId],
      );
    }

    // Set Employee Performance Bonus Rate
    if (rubricPerformanceRateId) {
      transaction.addQuery(
        updateStaffingIndice,
        [performanceBonusRate, id, emp.employee_buid, rubricPerformanceRateId],
      );
    }

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
    if (rubricNumberOfDaysId) {
      transaction.addQuery(
        updateStaffingIndice,
        [workingDays, id, emp.employee_buid, rubricNumberOfDaysId],
      );
    }
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
     SELECT BUID(emp.uuid) AS employee_uuid, emp.uuid AS employee_buid, ind.grade_indice,
     ind.function_indice, ind.created_at, emp.date_embauche
     FROM payroll_configuration AS pc
     JOIN config_employee AS ce ON ce.id = pc.config_employee_id
     JOIN config_employee_item AS cei ON cei.config_employee_id = ce.id
     JOIN employee AS emp ON emp.uuid = cei.employee_uuid
     JOIN staffing_indice AS ind ON ind.employee_uuid = emp.uuid
     JOIN (
       SELECT st.employee_uuid, MAX(st.created_at) AS created_at
       FROM staffing_indice AS st
       GROUP BY st.employee_uuid
     ) st_ind ON (st_ind.employee_uuid = ind.employee_uuid AND st_ind.created_at = ind.created_at)
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

  const sqlGetEndOfPeriod = `
    SELECT pc.dateTo FROM payroll_configuration AS pc WHERE pc.id = ?;`;

  return Promise.all([
    db.exec(sqlGetStagePaymentIndice, [payrollConfigurationId]),
    db.exec(sqlGetEmployees, [payrollConfigurationId]),
    db.exec(sqlGetAggregateOtherProfits, [payrollConfigurationId]),
    db.exec(sqlGetRubricMonetaryValue, [payrollConfigurationId]),
    db.exec(sqlGetEndOfPeriod, [payrollConfigurationId]),
  ]);

}

module.exports.detail = detail;
module.exports.create = create;
