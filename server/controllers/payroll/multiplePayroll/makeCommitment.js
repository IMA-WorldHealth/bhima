/**
 *
 * @description
 * This controller makes it possible to make entries to make the payment commitment,
 *
 *
 * @requires db
 * @requires configurationData
 * @requires transac
 * @requires Exchange
 */

const q = require('q');
const db = require('../../../lib/db');
const configurationData = require('./find');
const transac = require('./commitment');
const Exchange = require('../../finance/exchange');

function config(req, res, next) {
  // Collection of employee references select
  let employeesUuid = req.body.data;

  employeesUuid = [].concat(employeesUuid);
  employeesUuid = employeesUuid.map(uid => db.bid(uid));

  const payrollConfigurationId = req.params.id;
  const projectId = req.session.project.id;
  const userId = req.session.user.id;
  const currencyId = req.session.enterprise.currency_id;

  const data = {};

  // Obtaining the expense account for the remuneration of employees' salaries,
  const sqlGetAccountPayroll = `
    SELECT payroll_configuration.id, payroll_configuration.label, payroll_configuration.config_accounting_id,
    payroll_configuration.dateFrom, payroll_configuration.dateTo, config_accounting.account_id
    FROM payroll_configuration
    JOIN config_accounting ON config_accounting.id = payroll_configuration.config_accounting_id
    WHERE payroll_configuration.id = ?
  `;

  /*
    * The following requests to retrieve the list of Topics configured
    * for a payment period but also the values of the corresponding data corresponding to each employee
  */

  const sqlGetRubricConfig = `
    SELECT config_rubric_item.id AS configId, config_rubric_item.config_rubric_id,
    config_rubric_item.rubric_payroll_id, payroll_configuration.label AS PayrollConfig, rubric_payroll.*
    FROM config_rubric_item
    JOIN rubric_payroll ON rubric_payroll.id = config_rubric_item.rubric_payroll_id
    JOIN payroll_configuration ON payroll_configuration.config_rubric_id = config_rubric_item.config_rubric_id
    WHERE payroll_configuration.id = ?
  `;

  const sqlGetRubricPayroll = `
    SELECT paiement.payroll_configuration_id, BUID(paiement.uuid) AS uuid, paiement.basic_salary, 
    BUID(paiement.employee_uuid) AS employee_uuid, 
    paiement.base_taxable, paiement.currency_id, rubric_payroll.is_employee, rubric_payroll.is_discount, 
    rubric_payroll.label, rubric_payroll.id, rubric_payroll.is_tax, rubric_payroll.is_social_care,
    rubric_payroll.is_membership_fee, rubric_payroll.debtor_account_id, rubric_payroll.expense_account_id,
    rubric_paiement.value, rubric_payroll.is_associated_employee, employee.reference
    FROM paiement
    JOIN rubric_paiement ON rubric_paiement.paiement_uuid = paiement.uuid
    JOIN rubric_payroll ON rubric_payroll.id = rubric_paiement.rubric_payroll_id
    JOIN employee ON employee.uuid = paiement.employee_uuid
    WHERE paiement.employee_uuid IN (?) AND paiement.payroll_configuration_id = ?  AND rubric_paiement.value > 0
    `;

  const options = {
    payroll_configuration_id : payrollConfigurationId,
    employeesUuid,
  };

  configurationData.find(options)
    .then(dataEmployees => {
      data.employees = dataEmployees;

      return q.all([
        db.exec(sqlGetRubricPayroll, [employeesUuid, payrollConfigurationId]),
        db.exec(sqlGetRubricConfig, [payrollConfigurationId]),
        db.exec(sqlGetAccountPayroll, [payrollConfigurationId]),
        Exchange.getCurrentExchangeRateByCurrency(),
      ]);
    })
    .spread((rubricsEmployees, rubricsConfig, account, exchangeRates) => {
      const transactions = transac.commitments(
        data.employees,
        rubricsEmployees,
        rubricsConfig,
        account,
        projectId,
        userId,
        exchangeRates,
        currencyId,
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
