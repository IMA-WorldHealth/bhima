const chai = require('chai');
const helpers = require('../shared/helpers');
const EmployeeConfigPage = require('./employees_config.page');


/** configuring helpers* */
helpers.configure(chai);

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

  it('successfully creates a new Employee Configuration', () => {
    Page.create(employeeConfig);
  });

  it('successfully edits a Employee Configuration', () => {
    Page.update(employeeConfig.label, updateEmployeeConfig);
  });

  it('successfully Set Employees in Employee Configuration', () => {
    Page.setEmployeeConfig(updateEmployeeConfig.label);
  });

  it('successfully unset Employees in Employee Configuration', () => {
    Page.unsetEmployeeConfig(updateEmployeeConfig.label);
  });

  it('successfully set Employees in Employee Configuration', () => {
    Page.setEmployeeConfig(employeeConfig.oldConfig);
  });

  it('don\'t create when incorrect Employee', () => {
    Page.errorOnCreateEmployeeConfig();
  });

  it('successfully delete a employee', () => {
    Page.remove(updateEmployeeConfig.label);
  });

});
