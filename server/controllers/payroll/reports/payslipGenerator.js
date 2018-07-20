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
const Exchange = require('../../finance/exchange');
const q = require('q');

const templatePayslip = './server/controllers/payroll/reports/payslipGenerator.handlebars';
const templatePayrollReport = './server/controllers/payroll/reports/payrollReportGenerator.handlebars';
const templateSocialCharge = './server/controllers/payroll/reports/payrollReportSocialCharge.handlebars';

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
  let TEMPLATE;
  let orientation = 'landscape';
  const footerRight = '[page] / [toPage]';

  const params = {
    payroll_configuration_id : options.idPeriod,
    reference : options.employees,
  };

  if (options.currency && options.socialCharge) {
    TEMPLATE = templateSocialCharge;
    orientation = 'portrait';
    options.footerRight = footerRight;

  } else if (options.currency && !options.socialCharge) {
    TEMPLATE = templatePayrollReport;

    options.footerRight = footerRight;
  } else {
    TEMPLATE = templatePayslip;
  }

  _.extend(options, {
    filename : 'FORM.LABELS.PAYSLIP',
    csvKey : 'payslipGenerator',
    orientation,
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

      return PayrollConfig.payrollReportElements(options.idPeriod, options.employees, employeesPaiementUuid);

    })
    .spread((rubrics, holidays, offDays, aggregateRubrics, aggregatePaiements, rubEmployees, rubEnterprises) => {
      let TotalChargeEnterprise = 0;

      // Set Aggregate of Rubrics
      data.aggregateRubrics = aggregateRubrics;
      data.total_basic_salary = aggregatePaiements[0].total_basic_salary;
      data.total_base_taxable = aggregatePaiements[0].total_base_taxable;
      data.total_gross_salary = aggregatePaiements[0].total_gross_salary;
      data.total_net_salary = aggregatePaiements[0].total_net_salary;
      data.total_non_taxable = aggregatePaiements[0].total_gross_salary - aggregatePaiements[0].total_base_taxable;
      data.total_deduction = aggregatePaiements[0].total_gross_salary - aggregatePaiements[0].total_net_salary;

      data.rubrics = rubEmployees;
      data.rubrics.forEach(rub => {
        data.aggregateRubrics.forEach(aggr => {
          if (rub.abbr === aggr.abbr) {
            rub.total = aggr.result;
          }
        });
      });

      data.rubEnterprises = rubEnterprises;
      data.rubEnterprises.forEach(rub => {
        data.aggregateRubrics.forEach(aggr => {
          if (rub.abbr === aggr.abbr) {
            rub.total = aggr.result;
          }
        });
      });

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

        TotalChargeEnterprise += somChargeEnterprise;

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

      // Total Of Enterprise Charge
      data.TotalChargeEnterprise = TotalChargeEnterprise;

      return PayrollConfig.lookupPayrollConfig(options.idPeriod);
    })
    .then(payrollPeriod => {
      data.payrollPeriod = payrollPeriod;

      return Exchange.getExchangeRate(data.enterprise.id, options.currency, new Date(data.payrollPeriod.dateTo));
    })
    .then(exchange => {
      const exchangeRate = parseInt(options.currency) === parseInt(data.enterprise.currency_id) ? 1 : exchange.rate;
      data.payrollPeriod.exchangeRate = exchangeRate;
      data.payrollPeriod.currency = options.currency;

      return report.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

module.exports = build;
