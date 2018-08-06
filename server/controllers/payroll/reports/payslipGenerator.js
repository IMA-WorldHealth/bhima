/**
 * @method build
 *
 * @description
 * Generates employee pay slips, reports of pay slips for selected employees, 
 * and reports of payroll taxes related to employee payments
 *
 * GET /reports/payroll/employees
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

  PayrollConfig.lookupPayrollConfig(options.idPeriod)
    .then(payrollPeriod => {
      data.payrollPeriod = payrollPeriod;
      return Exchange.getExchangeRate(data.enterprise.id, options.currency, new Date(data.payrollPeriod.dateTo));
    })
    .then(exchange => {
      data.payrollPeriod.exchangeRate = parseInt(options.currency) === parseInt(data.enterprise.currency_id) ?
        1 : exchange.rate;
      return Exchange.getCurrentExchangeRateByCurrency(new Date(data.payrollPeriod.dateTo));
    })
    .then(exchangeRatesByCurrency => {
      data.exchangeRatesByCurrency = exchangeRatesByCurrency;
      data.payrollPeriod.currency = options.currency;
      return configurationData.find(params);
    })
    .then(dataEmployees => {
      // Set Aggregate of Rubrics
      let totalNetSalary = 0;
      let totalBasicSalary = 0;
      let totalBaseTaxable = 0;
      let totalGrossSalary = 0;

      dataEmployees.forEach(employee => {
        data.exchangeRatesByCurrency.forEach(exchange => {
          employee.net_salary_equiv = parseInt(exchange.currency_id) === parseInt(employee.currency_id) ?
            employee.net_salary / exchange.rate : employee.net_salary;
          employee.daily_salary_equiv = parseInt(exchange.currency_id) === parseInt(employee.currency_id) ?
            employee.daily_salary / exchange.rate : employee.daily_salary;
          employee.base_taxable_equiv = parseInt(exchange.currency_id) === parseInt(employee.currency_id) ?
            employee.base_taxable / exchange.rate : employee.base_taxable;
          employee.basic_salary_equiv = parseInt(exchange.currency_id) === parseInt(employee.currency_id) ?
            employee.basic_salary / exchange.rate : employee.basic_salary;
          employee.gross_salary_equiv = parseInt(exchange.currency_id) === parseInt(employee.currency_id) ?
            employee.gross_salary / exchange.rate : employee.gross_salary;
          employee.net_salary_equiv = parseInt(exchange.currency_id) === parseInt(employee.currency_id) ?
            employee.net_salary / exchange.rate : employee.net_salary;
          employee.net_salary_equiv = parseInt(exchange.currency_id) === parseInt(employee.currency_id) ?
            employee.net_salary / exchange.rate : employee.net_salary;
          totalNetSalary += employee.net_salary_equiv;
          totalBasicSalary += employee.basic_salary_equiv;
          totalBaseTaxable += employee.base_taxable_equiv;
          totalGrossSalary += employee.gross_salary_equiv;
        });
      });

      data.dataEmployees = dataEmployees;
      // Set Aggregate of Rubrics
      data.total_basic_salary = totalBasicSalary;
      data.total_taxable = totalBaseTaxable - totalBasicSalary;
      data.total_gross_salary = totalGrossSalary;
      data.total_net_salary = totalNetSalary;
      data.total_non_taxable = totalGrossSalary - totalBaseTaxable;
      data.total_deduction = totalGrossSalary - totalNetSalary;
      // Get paiement_uuid for Selected Employee
      const employeesPaiementUuid = dataEmployees.map(emp => db.bid(emp.uuid));
      return PayrollConfig.payrollReportElements(options.idPeriod, options.employees, employeesPaiementUuid);
    })
    .spread((rubrics, holidays, offDays, aggregateRubrics, aggregatePaiements, rubEmployees, rubEnterprises) => {
      let TotalChargeEnterprise = 0;
      rubrics.forEach(rubrics => {
        data.exchangeRatesByCurrency.forEach(exchange => {
          rubrics.result_equiv =
            exchange.currency_id === rubrics.currency_id ? rubrics.result / exchange.rate : rubrics.result;
        });
      });
      data.rubrics = rubEmployees;
      data.rubrics.forEach(rub => {
        let totalRub = 0;
        rubrics.forEach(rubrics => {
          if (rub.abbr === rubrics.abbr) {
            totalRub += rubrics.result_equiv;
          }
        });
        rub.total = totalRub;
      });

      data.rubEnterprises = rubEnterprises;
      data.rubEnterprises.forEach(rub => {
        let totalRub = 0;
        rubrics.forEach(rubrics => {
          if (rub.abbr === rubrics.abbr) {
            totalRub += rubrics.result_equiv;
          }
        });
        rub.total = totalRub;
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
        data.exchangeRatesByCurrency.forEach(exchange => {
          employee.somRubTaxable_equiv = parseInt(exchange.currency_id) === parseInt(employee.currency_id) ?
            employee.somRubTaxable / exchange.rate : employee.somRubTaxable;
          employee.somRubNonTaxable_equiv = parseInt(exchange.currency_id) === parseInt(employee.currency_id) ?
            employee.somRubNonTaxable / exchange.rate : employee.somRubNonTaxable;
          employee.somChargeEnterprise_equiv = parseInt(exchange.currency_id) === parseInt(employee.currency_id) ?
            employee.somChargeEnterprise / exchange.rate : employee.somChargeEnterprise;
          employee.somChargeEmployee_equiv = parseInt(exchange.currency_id) === parseInt(employee.currency_id) ?
            employee.somChargeEmployee / exchange.rate : employee.somChargeEmployee;
        });
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
      return report.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}
module.exports = build;
