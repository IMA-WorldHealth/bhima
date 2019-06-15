const helpers = require('../shared/helpers');
const EmployeeConfigPage = require('./employees_config.page');

describe('Employees Configuration Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/payroll/employee_configuration'));

  const Page = new EmployeeConfigPage();

  const employeeConfig = {
    label : 'Configuration 2013',
    oldConfig : 'Configuration des Employés',
  };

  const updateEmployeeConfig = {
    label : 'Configuration 2013 Updated',
  };

  it('successfully creates a new Employee Configuration', async () => {
    await Page.create(employeeConfig);
  });

  it('successfully edits a Employee Configuration', async () => {
    await Page.update(employeeConfig.label, updateEmployeeConfig);
  });

  it('successfully Set Employees in Employee Configuration', async () => {
    await Page.setEmployeeConfig(updateEmployeeConfig.label);
  });

  it('successfully unset Employees in Employee Configuration', async () => {
    await Page.unsetEmployeeConfig(updateEmployeeConfig.label);
  });

  it('successfully set Employees in Employee Configuration', async () => {
    await Page.setEmployeeConfig(employeeConfig.oldConfig);
  });

  it('don\'t create when incorrect Employee', async () => {
    await Page.errorOnCreateEmployeeConfig();
  });

  it('successfully delete a employee', async () => {
    await Page.remove(updateEmployeeConfig.label);
  });

});
