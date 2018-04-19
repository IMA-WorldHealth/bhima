
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

const TEMPLATE = './server/controllers/payroll/reports/payslipGenerator.handlebars';
const PayrollConfig = require('../configuration');

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
  const typeVar = Array.isArray(options.employees);

  options.employees = !typeVar ? [JSON.parse(options.employees)] : options.employees;

  // options.employees = [JSON.parse(options.employees)];

  _.extend(options, {
    filename : 'FORM.LABELS.PAYSLIP',
    csvKey : 'payslipGenerator',
    orientation : 'portrait',
    footerFontSize : '7',
  });

  let report;
  const getPaiementRubrics = [];
  const getHolidays = [];
  const getOffDays = [];
  const employeeData = [];

  const data = {};

  data.enterprise = req.session.enterprise;
  data.user = req.session.user;
  data.lang = options.lang;

  // set up the report with report manager
  try {
    report = new ReportManager(TEMPLATE, req.session, options);
    delete options.orientation;
  } catch (e) {
    next(e);
    return;
  }

  options.employees.forEach(emp => {
    const employee = typeVar ? JSON.parse(emp) : emp;

    employeeData.push({ employee });

    const sql = `
      SELECT rubric_paiement.paiement_uuid, rubric_paiement.value AS result, BUID(paiement.employee_uuid) AS employee_uuid, 
      rubric_payroll.abbr, rubric_payroll.label, rubric_payroll.is_percent, rubric_payroll.value, rubric_payroll.is_discount, 
      rubric_payroll.is_social_care, rubric_payroll.is_employee
      FROM rubric_paiement
      JOIN paiement ON paiement.uuid = rubric_paiement.paiement_uuid
      JOIN rubric_payroll ON rubric_payroll.id = rubric_paiement.rubric_payroll_id
      WHERE paiement.payroll_configuration_id = ? AND paiement.employee_uuid = ?
      ORDER BY rubric_payroll.label, rubric_payroll.is_social_care ASC, rubric_payroll.is_discount ASC 
    `;

    const sqlHolidayPaiement = `
      SELECT holiday_paiement.holiday_nbdays, holiday_paiement.holiday_nbdays, holiday_paiement.holiday_percentage, 
      holiday_paiement.label, holiday_paiement.value, BUID(holiday_paiement.paiement_uuid) AS paiement_uuid
      FROM holiday_paiement
      WHERE holiday_paiement.paiement_uuid = ?
    `;


    const sqlOffDayPaiement = `
      SELECT offday_paiement.offday_percentage, BUID(offday_paiement.paiement_uuid) AS paiement_uuid, offday_paiement.label, 
      offday_paiement.value
      FROM offday_paiement
      WHERE offday_paiement.paiement_uuid = ?
    `;

    getPaiementRubrics.push({
      query : sql,
      params : [options.idPeriod, db.bid(employee.employee_uuid)],
    });

    getHolidays.push({
      query : sqlHolidayPaiement,
      params : [db.bid(employee.uuid)],
    });

    getOffDays.push({
      query : sqlOffDayPaiement,
      params : [db.bid(employee.uuid)],
    });
  });

  // initialise the transaction handler
  const transaction = db.transaction();
  const transactionHoliday = db.transaction();
  const transactionOffDay = db.transaction();

  getPaiementRubrics.forEach(item => {
    transaction.addQuery(item.query, item.params);
  });

  getHolidays.forEach(item => {
    transactionHoliday.addQuery(item.query, item.params);
  });

  getOffDays.forEach(item => {
    transactionOffDay.addQuery(item.query, item.params);
  });

  transaction.execute()
    .then((results) => {
      employeeData.forEach(emp => {
        emp.employee.rubricTaxable = [];
        emp.employee.rubricNonTaxable = [];
        emp.employee.rubricDiscount = [];
        let somRubTaxable = 0;
        let somRubNonTaxable = 0;
        let somChargeEmployee = 0;
        let somChargeEnterprise = 0;

        results.forEach(rubEmployee => {
          rubEmployee.forEach(rubrics => {
            if (emp.employee.employee_uuid === rubrics.employee_uuid) {
              rubrics.ratePercentage = rubrics.is_percent ? rubrics.value : '---';

              // Get Rubric Taxable
              if (!rubrics.is_discount && !rubrics.is_social_care) {
                somRubTaxable += rubrics.result;
                emp.employee.rubricTaxable.push(rubrics);
              }

              // Get Rubric Non Taxable
              if (!rubrics.is_discount && rubrics.is_social_care) {
                somRubNonTaxable += rubrics.result;
                emp.employee.rubricNonTaxable.push(rubrics);
              }

              // Get Charge
              if (rubrics.is_discount) {
                if (rubrics.is_employee) {
                  rubrics.chargeEmployee = rubrics.result;
                  rubrics.chargeEnterprise = 0;

                  somChargeEmployee += rubrics.result;
                } else {
                  rubrics.chargeEmployee = 0;
                  rubrics.chargeEnterprise = rubrics.result;

                  somChargeEnterprise += rubrics.result;
                }

                emp.employee.rubricDiscount.push(rubrics);
              }
            }
          });
        });

        emp.employee.somRubTaxable = somRubTaxable;
        emp.employee.somRubNonTaxable = somRubNonTaxable;
        emp.employee.somChargeEmployee = somChargeEmployee;
        emp.employee.somChargeEnterprise = somChargeEnterprise;
      });

      return transactionHoliday.execute();
    })
    .then(results => {
      employeeData.forEach(emp => {
        emp.employee.holidaysPaid = [];
        emp.employee.dailyWorkedValue = emp.employee.daily_salary * emp.employee.working_day;

        results.forEach(holidayEmployee => {
          holidayEmployee.forEach(holiday => {
            if (emp.employee.uuid === holiday.paiement_uuid) {
              holiday.dailyRate = holiday.value / holiday.holiday_nbdays;
              emp.employee.holidaysPaid.push(holiday);
            }
          });
        });
      });

      return transactionOffDay.execute();
    })
    .then(results => {
      employeeData.forEach(emp => {
        emp.employee.offDaysPaid = [];
        results.forEach(offDayEmployee => {
          offDayEmployee.forEach(offDay => {
            if (emp.employee.uuid === offDay.paiement_uuid) {
              emp.employee.offDaysPaid.push(offDay);
            }
          });
        });
      });

      data.elementsPayslip = employeeData;

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
