/**
 *
 * @description
 * This controller makes it possible to make entries to make the payment commitment,
 *
 *
 * @requires db
 * @requires EmployeeData
 */

const db = require('../../../lib/db');
const EmployeeData = require('../employees');
const moment = require('moment');
const configurationData = require('./find');
const transac = require('./commitment');

function config(req, res, next) {
  // Collection of employee references select
  const referenceEmployees = req.body.data;

  const payrollConfigurationId = req.params.id;
  const projectId = req.session.project.id;
  const userId = req.session.user.id;

  const data = {};

  // Obtaining the expense account for the remuneration of employees' salaries,
  const sqlGetAccountPayroll = `
    SELECT payroll_configuration.id, payroll_configuration.config_accounting_id, payroll_configuration.dateFrom, 
    payroll_configuration.dateTo, config_accounting.account_id
    FROM payroll_configuration
    JOIN config_accounting ON config_accounting.id = payroll_configuration.config_accounting_id
    WHERE payroll_configuration.id = ?
  `;

  /*
    * This request is used to retrieve the values of the rubrics found
    * in the payment table in order to determine for each of its rubrics
    * the expense and profit accounts For each Employees
  */
  const sqlGetRubricPayroll = `
    SELECT paiement.payroll_configuration_id, BUID(paiement.uuid) AS uuid, paiement.basic_salary, 
    BUID(paiement.employee_uuid) AS employee_uuid, 
    paiement.base_taxable, paiement.currency_id, rubric_payroll.is_employee, rubric_payroll.is_discount, 
    rubric_payroll.label, rubric_payroll.is_tax, rubric_payroll.is_social_care, rubric_payroll.is_membership_fee, 
    rubric_payroll.debtor_account_id, rubric_payroll.expense_account_id, rubric_paiement.value,
    rubric_payroll.is_associated_employee, employee.reference
    FROM paiement
    JOIN rubric_paiement ON rubric_paiement.paiement_uuid = paiement.uuid
    JOIN rubric_payroll ON rubric_payroll.id = rubric_paiement.rubric_payroll_id
    JOIN employee ON employee.uuid = paiement.employee_uuid
    WHERE employee.reference IN (?) AND rubric_paiement.value > 0
    `;

  const options = {
    payroll_configuration_id : payrollConfigurationId,
    reference : referenceEmployees,
  };

  configurationData.find(options)
    .then(dataEmployees => {
      data.employees = dataEmployees;

      return db.exec(sqlGetRubricPayroll, [referenceEmployees]);
    })
    .then(dataRubricsEmployees => {
      data.rubricsEmployees = dataRubricsEmployees;
      return db.exec(sqlGetAccountPayroll, [payrollConfigurationId]);
    })
    .then(account => {
      const transactions = transac.commitments(
        data.employees,
        data.rubricsEmployees,
        account,
        projectId,
        userId
      );

      const postingJournal = db.transaction();

      transactions.forEach(item => {
        postingJournal.addQuery(item.query, item.params);
      });

      return postingJournal.execute();
    })
    .then(() => {
      res.sendStatus(201);
    })
    .catch(next)
    .done();
}

// Make commitment of paiement
exports.config = config;
