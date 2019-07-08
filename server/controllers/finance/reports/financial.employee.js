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
const Debtors = require('../../finance/debtors');
const db = require('../../../lib/db');

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
async function build(req, res, next) {
  const options = req.query;

  let report;

  _.defaults(options, PDF_OPTIONS);

  // set up the report with report manager
  try {
    report = new ReportManager(TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  try {

    const data = {};
    const sql = `
      SELECT BUID(p.debtor_uuid) as debtor_uuid
      FROM patient p
      JOIN employee em ON p.uuid = em.patient_uuid
      WHERE em.uuid = ?`;

    const [employee, patient] = await Promise.all([
      Employee.lookupEmployee(options.employee_uuid),
      db.one(sql, db.bid(options.employee_uuid)),
    ]);

    // get debtor/creditor information
    const [creditorOperations, debtorOperations] = await Promise.all([
      Creditors.getFinancialActivity(employee.creditor_uuid),
      Debtors.getFinancialActivity(patient.debtor_uuid, true),
    ]);

    _.extend(data, {
      employee,
      creditorTransactions : creditorOperations.transactions,
      creditorAggregates : creditorOperations.aggregates,
      debtorTransactions : debtorOperations.transactions,
      debtorAggregates : debtorOperations.aggregates,
    });

    // employee balance
    data.includeMedicalCare = parseInt(options.includeMedicalCare, 10) === 1;

    // For the Employee Standing report, it must be mentioned if the employee has a credit or debit balance
    data.balanceCreditorText = data.creditorAggregates.balance >= 0
      ? 'FORM.LABELS.CREDIT_BALANCE' : 'FORM.LABELS.DEBIT_BALANCE';

    // let render
    const result = await report.render(data);
    return res.set(result.headers).send(result.report);

  } catch (error) {
    return next(error);
  }
}

exports.report = build;
