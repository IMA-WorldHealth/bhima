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
const Creditors = require('../creditors');
const Debtors = require('../debtors');
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
 * GET /reports/finance/employee_standing/:uuid
 */
async function build(req, res, next) {
  const options = req.query;
  let report;
  options.extractEmployee = parseInt(options.extractEmployee, 10);

  if (!options.extractEmployee) {
    options.dateFrom = ``;
    options.dateTo = ``;
  }

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
      Creditors.getFinancialActivity(employee.creditor_uuid, options.dateFrom, options.dateTo),
      Debtors.getFinancialActivity(patient.debtor_uuid, true),
    ]);

    _.extend(data, {
      employee,
      creditorTransactions : creditorOperations.transactions,
      creditorAggregates : creditorOperations.aggregates,
      debtorTransactions : debtorOperations.transactions,
      debtorAggregates : debtorOperations.aggregates,
    });

    if (creditorOperations.openingBalance) {
      _.extend(data, {
        creditorOpeningBalance : creditorOperations.openingBalance[0],
      });
    }

    // provides the latest element of the table,
    // as the request is ordered by date, the last line item will
    // also be the employee's balance for the search period
    if (options.extractEmployee) {

      const lastTxn = _.last(creditorOperations.transactions);
      data.lastTransaction = lastTxn || { cumsum : 0 };
      data.extratCreditorText = data.lastTransaction.cumsum >= 0
        ? 'FORM.LABELS.CREDIT_BALANCE' : 'FORM.LABELS.DEBIT_BALANCE';

      data.dates = {
        dateFrom : options.dateFrom,
        dateTo : options.dateTo,
      };
    }

    // employee balance
    data.includeMedicalCare = parseInt(options.includeMedicalCare, 10) === 1;
    data.extractEmployee = options.extractEmployee === 1;
    data.employeeStandingReport = !data.extractEmployee;

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
