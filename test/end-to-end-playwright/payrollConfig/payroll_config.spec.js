const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const PayrollConfigPage = require('./payroll_config.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Payroll Configuration Management', () => {

  test.beforeEach(async () => {
    await TU.navigate('#!/payroll');

    // Make sure the grid is loaded
    await TU.waitForSelector('.ui-grid-canvas .ui-grid-row');
  });

  const page = new PayrollConfigPage();

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

  test('successfully creates a Configuration Payroll Period', async () => {
    await page.createPayrollConfig(payrollConfig);
  });

  test('successfully edits a Configuration Payroll Period', async () => {
    await page.editPayrollConfig(payrollConfig.label, updatePayrollConfig);
  });

  test('do not create when incorrect Configuration Payroll Period', async () => {
    await page.errorOnCreatePayrollConfig();
  });

  test('successfully delete a Configuration Payroll Period', async () => {
    await page.deletePayrollConfig(updatePayrollConfig.label);
  });
});
