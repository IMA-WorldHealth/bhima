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
const defaultMode = require('./commitment');
const groupedMode = require('./groupedCommitment');
const individuallyMode = require('./commitmentByEmployee');

const Exchange = require('../../finance/exchange');
const CostCenter = require('../../finance/cost_center');

function config(req, res, next) {
  // Collection of employee references select
  let employeesUuid = req.body.data;

  employeesUuid = [].concat(employeesUuid);
  employeesUuid = employeesUuid.map(uid => db.bid(uid));

  const payrollConfigurationId = req.params.id;
  const projectId = req.session.project.id;
  const userId = req.session.user.id;
  const currencyId = req.session.enterprise.currency_id;
  const postingPayrollCostCenterMode = req.session.enterprise.settings.posting_payroll_cost_center_mode;

  const data = {};

  /*
    * With this request we retrieve the identifier of the configuration period,
    * the label, the account that was used for the configuration, the fiscal year as well as the period
  */
  const sqlGetAccountPayroll = `
    SELECT payroll_configuration.id, payroll_configuration.label, payroll_configuration.config_accounting_id,
    payroll_configuration.dateFrom, payroll_configuration.dateTo, config_accounting.account_id,
    period.fiscal_year_id, period.id AS period_id
    FROM payroll_configuration
    JOIN config_accounting ON config_accounting.id = payroll_configuration.config_accounting_id
    JOIN period ON period.start_date <= payroll_configuration.dateTo AND period.end_date >= payroll_configuration.dateTo
    WHERE payroll_configuration.id = ?
  `;

  /*
    * The following requests to retrieve the list of Rubrics configured
    * for a payment period but also the values of the corresponding data corresponding to each employee
  */
  const sqlGetRubricConfig = `
    SELECT config_rubric_item.id AS configId, config_rubric_item.config_rubric_id,
    config_rubric_item.rubric_payroll_id, payroll_configuration.label AS PayrollConfig, rubric_payroll.*
    FROM config_rubric_item
    JOIN rubric_payroll ON rubric_payroll.id = config_rubric_item.rubric_payroll_id
    JOIN payroll_configuration ON payroll_configuration.config_rubric_id = config_rubric_item.config_rubric_id
    WHERE payroll_configuration.id = ?
    AND rubric_payroll.debtor_account_id IS NOT NULL AND rubric_payroll.expense_account_id IS NOT NULL
  `;

  /*
    * With this request, we retrieve the data configured for the payroll for each employee
    * while taking the characteristics of items
  */
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

  /*
   * With this request, we break down all the expense accounts for the employer's share by cost center
   * linked to the service assigned to each employee.
  */
  const sqlCostBreakdownByCostCenter = `
    SELECT rp.paiement_uuid,  SUM(rp.value) AS value_cost_center_id,
      cc.id AS cost_center_id, a_exp.id AS account_expense_id
    FROM rubric_paiement AS rp
    JOIN rubric_payroll AS rb ON rb.id = rp.rubric_payroll_id
    JOIN paiement AS paie ON paie.uuid = rp.paiement_uuid
    JOIN employee AS emp ON emp.uuid = paie.employee_uuid
    JOIN patient AS pat ON pat.uuid = emp.patient_uuid
    LEFT JOIN service AS ser ON ser.uuid = emp.service_uuid
    LEFT JOIN service_cost_center AS s_cost ON s_cost.service_uuid = ser.uuid
    LEFT JOIN cost_center AS cc ON cc.id = s_cost.cost_center_id
    JOIN account AS a_deb ON a_deb.id = rb.debtor_account_id
    JOIN account AS a_exp ON a_exp.id = rb.expense_account_id
    WHERE rb.is_employee = 0 AND rb.is_discount = 1  AND paie.payroll_configuration_id = ?
    GROUP BY cc.id;
  `;

  /*
   * With this query we try to break down the basic salaries of employees by cost center.
  */
  const sqlSalaryByCostCenter = `
    SELECT emp.code, SUM(emp.individual_salary) AS salary_service, cc.id AS cost_center_id, cc.label AS costCenterLabel
      FROM employee AS emp
    LEFT JOIN service_cost_center AS scc ON scc.service_uuid = emp.service_uuid
    LEFT JOIN cost_center AS cc ON cc.id = scc.cost_center_id
    WHERE emp.uuid IN (?)
    GROUP BY cc.id;
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
        db.exec(sqlCostBreakdownByCostCenter, [payrollConfigurationId]),
        db.exec(sqlSalaryByCostCenter, [employeesUuid]),
        Exchange.getCurrentExchangeRateByCurrency(),
        CostCenter.getAllCostCenterAccounts(),
      ]);
    })
    .spread((rubricsEmployees, rubricsConfig, configuration,
      costBreakDown, SalaryByCostCenter, exchangeRates, accountsCostCenter) => {
      let transactions;
      const postingJournal = db.transaction();

      const sessionParams = {
        project_id : req.session.project.id,
        project_abbr : req.session.project.abbr,
        fiscal_year_id : configuration[0].fiscal_year_id,
        period_id : configuration[0].period_id,
        user_id :  req.session.user.id,
      };

      if (postingPayrollCostCenterMode === 'default') {
        transactions = defaultMode.commitments(
          data.employees,
          rubricsEmployees,
          rubricsConfig,
          configuration,
          projectId,
          userId,
          exchangeRates,
          currencyId,
          accountsCostCenter,
        );

        transactions.forEach(item => {
          postingJournal.addQuery(item.query, item.params);
        });

      } else if (postingPayrollCostCenterMode === 'grouped') {
        transactions = groupedMode.groupedCommitments(
          data.employees,
          rubricsEmployees,
          rubricsConfig,
          configuration,
          projectId,
          userId,
          exchangeRates,
          currencyId,
          accountsCostCenter,
          costBreakDown,
          SalaryByCostCenter,
        );

        transactions.forEach(item => {
          postingJournal.addQuery(item.query, item.params);
        });
      } else if (postingPayrollCostCenterMode === 'individually') {
        transactions = individuallyMode.commitmentByEmployee(
          data.employees,
          rubricsEmployees,
          configuration,
          projectId,
          userId,
          exchangeRates,
          currencyId,
          sessionParams,
        );

        transactions.forEach(item => {
          postingJournal.addQuery(item.query, item.params);
        });
      }

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
