const helpers = require('../shared/helpers');
const PayrollConfigPage = require('./payroll_config.page');
const chai = require('chai');


/** configuring helpers* */
helpers.configure(chai);

describe('Payroll Configuration Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/payroll'));

  const Page = new PayrollConfigPage();

  const payrollConfig = {
    label : 'new Configuration Period',
    period : 'month',
    config_rubric_id : 'Configuration des rubriques',
    config_accounting_id : 'Configuration Compte Rémunération',
    config_weekend_id : 'Configuration Semaine Normale',
    config_ipr_id : 'Bareme IPR 2013',
    config_employee_id : 'Configuration des Employés',
  };

  const updatePayrollConfig = {
    label : 'Configuration Period Current Month 2018',
    period : 'week',
  };

  it('successfully creates a Configuration Payroll Period', () => {
    Page.createPayrollConfig(payrollConfig);
  });

  it('successfully edits a Configuration Payroll Period', () => {
    Page.editPayrollConfig(payrollConfig.label, updatePayrollConfig);
  });

  it('don\'t create when incorrect Configuration Payroll Period', () => {
    Page.errorOnCreatePayrollConfig();
  });

  it('successfully delete a Configuration Payroll Period', () => {
    Page.deletePayrollConfig(updatePayrollConfig.label);
  });
});
