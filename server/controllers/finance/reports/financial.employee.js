/**
 * @overview server/controllers/finance/reports/financial.employee.js
 *
 * @description
 * This file contains code to create a PDF report for financial activities of an employee
 *
 * @requires Employee
 * @requires ReportManager
 */
const _ = require('lodash');
const ReportManager = require('../../../lib/ReportManager');

const Employee = require('../../payroll/employees');
const Creditors = require('../../finance/creditors');

const TEMPLATE = './server/controllers/finance/reports/financial.employee.handlebars';

const PDF_OPTIONS = {
  filename : 'FORM.LABELS.FINANCIAL_STATUS',
};

/**
 * @method build
 *
 * @description
 * This method builds the report of financial activities of an Employee.
 *
 * GET /reports/finance/employeeStanding/:uuid
 */
function build(req, res, next) {
  const options = req.query;

  let report;

  _.defaults(options, PDF_OPTIONS);

  // set up the report with report manager
  try {
    report = new ReportManager(TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  const data = {};

  return Employee.lookupEmployee(options.employee_uuid)
    .then(employee => {
      _.extend(data, { employee });
      return Creditors.getFinancialActivity(employee.creditor_uuid);
    })
    .then(({ transactions, aggregates }) => {
      aggregates.balanceText = aggregates.balance >= 0 ? 'FORM.LABELS.CREDIT_BALANCE' : 'FORM.LABELS.DEBIT_BALANCE';
      _.extend(data, { transactions, aggregates });
    })
    .then(() => report.render(data))
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

exports.report = build;
