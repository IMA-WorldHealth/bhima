/**
 * @method find
 *
 * @description
 * This method will apply filters from the options object passed in to
 * filter.
 */
const db = require('../../../lib/db');

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
  const enployeesGradeIndice = requestsUpdateIndices[1];
  const aggregateOtherProfits = requestsUpdateIndices[2];

  let totalCode = 0;
  enployeesGradeIndice.forEach(emp => {
    let totalDays = 0;
    emp.totalBase = 0;

    paymentIndice.forEach(ind => {
      if (emp.employee_uuid === ind.employee_uuid) {

        // Calcul Total days for rubrics where type is 'is_day_worked' and 'is_extra_day'
        if (ind.indice_type === 'is_day_worked' || ind.indice_type === 'is_extra_day') {
          totalDays += ind.rubric_value;
        }

        // Get TotalCodeId
        if (ind.indice_type === 'is_total_days') {
          ind.rubric_value = totalDays;
        }

        // Get is base index
        if (ind.indice_type === 'is_base_index') {
          ind.rubric_value = emp.grade_indice;
          emp.totalBase += emp.grade_indice;
        }

        // Get is responsability
        if (ind.indice_type === 'is_responsability') {
          ind.rubric_value = emp.function_indice;
          emp.totalBase += emp.function_indice;
        }

        // Get is other responsability
        if (ind.indice_type === 'is_other_responsability') {
          emp.totalBase += ind.rubric_value;
        }
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
    emp.indiceReajust = emp.dayIndex * totalDays;
    emp.totalCode = emp.indiceReajust + emp.otherProfits;

    totalCode += emp.totalCode;
    // set totalDays =
    // const updateStaffingIndice = `
    //   UPDATE staffing_indice_parameters SET rubric_value = ?
    //   WHERE payroll_configuration_id = ? AND employee_uuid = ? AND rubric_id = ?;
    // `;

    // if (rubricTotalDaysId) {
    //   transaction.addQuery(updateStaffingIndice, [totalDays, id, db.bid(emp.employee_uuid), rubricTotalDaysId]);
    // }

    // transaction.addQuery(updateStaffingIndice, [totalDays, id, db.bid(emp.employee_uuid), rubricTotalDaysId]);

    // paymentIndice.forEach(ind => {
    //   if (emp.employee_uuid === ind.employee_uuid) {
    //     // if (ind.indice_type === 'is_base_index') {
    //     //   console.log('BASE_INDEXXXXXXXXXXXXXXXXX');
    //     //   console.log(ind);
    //     // }

    //     // if (ind.indice_type === 'is_responsability') {
    //     //   console.log('RESPONSABILITEEEEEEEEEEeeeeeeeee');
    //     //   console.log(ind);
    //     // }

    //   }
    // });

    // console.log('EMPLOYEE_Code()');
    // console.log(emp);

  });

  console.log('TOTAL_CODE_BASE_DE_DONNEES()', totalCode);

  // transaction.addQuery('DELETE FROM staffing_indice_parameters WHERE payroll_configuration_id =?', id);
  // transaction.addQuery('INSERT INTO staffing_indice_parameters SET ?', data);
  // transaction.addQuery('CALL updateIndices(?)', id);
  // transaction.execute().then(() => {
  //   res.sendStatus(201);
  // }).catch(next);
}

async function stagePaymentIndice(payrollConfigurationId) {

  const sqlGetStagePaymentIndice = `
    SELECT BUID(spi.employee_uuid) AS employee_uuid, rub.label, rub.label, spi.rubric_value, rub.indice_type
    FROM stage_payment_indice AS spi
    JOIN rubric_payroll AS rub ON rub.id = spi.rubric_id
    WHERE spi.payroll_configuration_id = ? AND rub.is_indice = 1 AND rub.is_monetary_value = 0;  
  `;

  const sqlGetEmployees = `
    SELECT BUID(cei.employee_uuid) AS employee_uuid, ind.grade_indice, ind.function_indice
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

  return Promise.all([
    db.exec(sqlGetStagePaymentIndice, [payrollConfigurationId]),
    db.exec(sqlGetEmployees, [payrollConfigurationId]),
    db.exec(sqlGetAggregateOtherProfits, [payrollConfigurationId]),
  ]);

}

module.exports.detail = detail;
module.exports.create = create;
