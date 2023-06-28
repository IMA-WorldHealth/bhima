const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const EmployeeConfigPage = require('./employees_config.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Employees Configuration Management', () => {

  test.beforeEach(async () => {
    // navigate to the page
    await TU.navigate('/#!/payroll/employee_configuration');
  });

  const page = new EmployeeConfigPage();

  const employeeConfig = {
    label : 'Configuration 2013',
    oldConfig : 'Configuration des Employés',
  };

  const updateEmployeeConfig = {
    label : 'Configuration 2013 Updated',
  };

  test('successfully creates a new Employee Configuration', async () => {
    await page.create(employeeConfig);
  });

  test('successfully edits a Employee Configuration', async () => {
    await page.update(employeeConfig.label, updateEmployeeConfig);
  });

  test('successfully Set Employees in Employee Configuration', async () => {
    await page.setEmployeeConfig(updateEmployeeConfig.label);
  });

  test('successfully unset Employees in Employee Configuration', async () => {
    await page.unsetEmployeeConfig(updateEmployeeConfig.label);
  });

  test('successfully set Employees in Employee Configuration', async () => {
    await page.setEmployeeConfig(employeeConfig.oldConfig);
  });

  test('do not create when incorrect Employee', async () => {
    await page.errorOnCreateEmployeeConfig();
  });

  test('successfully delete a employee configuration', async () => {
    await page.remove(updateEmployeeConfig.label);
  });

});
