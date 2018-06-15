const helpers = require('../shared/helpers');
const EmployeeConfigPage = require('./employees_config.page');
const chai = require('chai');


/** configuring helpers**/
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
    Page.createEmployeeConfig(employeeConfig);
  });

  it('successfully edits a Employee Configuration', () => {
    Page.editEmployeeConfig(employeeConfig.label, updateEmployeeConfig);
  });

  it('successfully Set Employees in Employee Configuration', () => {
    Page.setEmployeeConfig(updateEmployeeConfig.label);
  });

  it('successfully InSet Employees in Employee Configuration', () => {
    Page.inSetEmployeeConfig(updateEmployeeConfig.label);
  });

  it('successfully InSet Employees in Employee Configuration', () => {
    Page.setEmployeeConfig(employeeConfig.oldConfig);
  });

  it('don\'t create when incorrect Employee', () => {
    Page.errorOnCreateEmployeeConfig();
  });

  it('successfully delete a Employee', () => {
    Page.deleteEmployeeConfig(updateEmployeeConfig.label);
  });

});