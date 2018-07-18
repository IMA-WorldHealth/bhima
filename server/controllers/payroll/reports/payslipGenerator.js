/**
 * @overview reports/payroll/multipayroll
 *
 * @description
 * This file contains code to create a PDF report of all MultiPayroll registrations,
 * matching query conditions passed from the multi Payroll UI grid.
 *
 * @requires lodash
 * @requires ReportManager
 */

const _ = require('lodash');

const ReportManager = require('../../../lib/ReportManager');
const db = require('../../../lib/db');
const q = require('q');

const TEMPLATE = './server/controllers/payroll/reports/payslipGenerator.handlebars';
const PayrollConfig = require('../configuration');
const configurationData = require('../multiplePayroll/find');

/**
 * @method build
 *
 * @description
 * This method builds the Payslips for employees payed to be shipped back to
 * the client.
 *
 * GET /reports/payroll/employees
 */
function build(req, res, next) {
  const options = _.clone(req.query);

  const params = {
    payroll_configuration_id : options.idPeriod,
    reference : options.employees,
  };

  _.extend(options, {
    filename : 'FORM.LABELS.PAYSLIP',
    csvKey : 'payslipGenerator',
    orientation : 'landscape',
    footerFontSize : '7',
  });

  let report;
  const getPaiementRubrics = [];
  const getHolidays = [];
  const getOffDays = [];

  const data = {};

  data.enterprise = req.session.enterprise;
  data.user = req.session.user;
  data.lang = options.lang;

  // set up the report with report manager
  try {
    report = new ReportManager(TEMPLATE, req.session, options);
  } catch (e) {
    next(e);
    return;
  }

  configurationData.find(params)
    .then(dataEmployees => {
      data.dataEmployees = dataEmployees;
      
      // Get paiement_uuid for Selected Employee
      const employeesPaiementUuid = dataEmployees.map(emp => db.bid(emp.uuid));

      const sql = `
        SELECT rubric_paiement.paiement_uuid, rubric_paiement.value AS result, 
        BUID(paiement.employee_uuid) AS employee_uuid, rubric_payroll.abbr, UPPER(rubric_payroll.label) AS label,
        rubric_payroll.is_percent, rubric_payroll.value, rubric_payroll.is_discount, 
        rubric_payroll.is_social_care, rubric_payroll.is_employee
        FROM rubric_paiement
        JOIN paiement ON paiement.uuid = rubric_paiement.paiement_uuid
        JOIN employee ON employee.uuid = paiement.employee_uuid
        JOIN rubric_payroll ON rubric_payroll.id = rubric_paiement.rubric_payroll_id
        WHERE paiement.payroll_configuration_id = ? AND employee.reference IN (?)
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

      return q.all([
        db.exec(sql, [options.idPeriod, options.employees]),
        db.exec(sqlHolidayPaiement, [employeesPaiementUuid]),
        db.exec(sqlOffDayPaiement, [employeesPaiementUuid]),
      ]);
    })
    .spread((rubrics, holidays, offDays) => {
      data.dataEmployees.forEach(employee => {

        employee.rubricTaxable = [];
        employee.rubricNonTaxable = [];
        employee.rubricDiscount = [];
        employee.holidaysPaid = [];
        employee.rubricsChargeEmployee = [];
        employee.rubricsChargeEnterprise = [];

        employee.daily_salary = employee.basic_salary / employee.total_day;        
        employee.dailyWorkedValue = employee.daily_salary * employee.working_day;

        
        let somRubTaxable = 0;
        let somRubNonTaxable = 0;
        let somChargeEmployee = 0;
        let somChargeEnterprise = 0;

        rubrics.forEach(rubrics => {
          if (employee.employee_uuid === rubrics.employee_uuid) {
            rubrics.ratePercentage = rubrics.is_percent ? rubrics.value : 0;

            // Get Rubric Taxable
            if (!rubrics.is_discount && !rubrics.is_social_care) {
              somRubTaxable += rubrics.result;
              employee.rubricTaxable.push(rubrics);
            }

            // Get Rubric Non Taxable
            if (!rubrics.is_discount && rubrics.is_social_care) {
              somRubNonTaxable += rubrics.result;
              employee.rubricNonTaxable.push(rubrics);
            }

            // Get Charge
            if (rubrics.is_discount) {
              if (rubrics.is_employee) {
                rubrics.chargeEmployee = rubrics.result;                
                employee.rubricsChargeEmployee.push(rubrics);
                somChargeEmployee += rubrics.result;
              } else {
                rubrics.chargeEnterprise = rubrics.result;
                employee.rubricsChargeEnterprise.push(rubrics);
                somChargeEnterprise += rubrics.result;
              }

              employee.rubricDiscount.push(rubrics);
            }
          }
        });

        employee.somRubTaxable = somRubTaxable;
        employee.somRubNonTaxable = somRubNonTaxable;
        employee.somChargeEnterprise = somChargeEnterprise;
        employee.somChargeEmployee = somChargeEmployee;

        holidays.forEach(holiday => {
          if (employee.uuid === holiday.paiement_uuid) {
            holiday.dailyRate = holiday.value / holiday.holiday_nbdays;
            employee.holidaysPaid.push(holiday);
          }
        });

        offDays.forEach(offDay => {
          if (employee.uuid === offDay.paiement_uuid) {
            employee.offDaysPaid.push(offDay);
          }
        });
      });

      return PayrollConfig.lookupPayrollConfig(options.idPeriod);
    })
    .then(payrollPeriod => {
      data.payrollPeriod = payrollPeriod;
      return report.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();

}

module.exports = build;
