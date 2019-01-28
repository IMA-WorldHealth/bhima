/* global element, by */
const chai = require('chai');
const helpers = require('../shared/helpers');
const PayrollProcessPage = require('./payroll_process.page');
const SearchModalPage = require('./searchModal.page.js');
const GU = require('../shared/GridUtils');
const components = require('../shared/components');

/** configuring helpers* */
helpers.configure(chai);

describe('Payroll Process Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/multiple_payroll'));

  const Page = new PayrollProcessPage();
  const searchModalPage = new SearchModalPage();

  const employeeCount = 4;

  const defaultValue = {
    period      : 'Février 2018',
    currency    : 2,
  };

  const employeeName = 'TEST 2 PATIENT';

  const gridId = 'multipayroll-grid';

  it(`should find Default Employee In Default Payroll Period`, () => {
    searchModalPage.payrollPeriod(defaultValue.period);
    searchModalPage.selectCurrency(defaultValue.currency);
    searchModalPage.submit();
    Page.getEmployeeCount(employeeCount, `The number of Defined employee should be ${employeeCount}`);

  });

  it(`Should configure multiple employees for Payment`, () => {
    GU.selectRow(gridId, 0);

    element(by.css('[data-action="open-menu"]')).click();
    element(by.css('[data-method="configure-payment"]')).click();

    components.notification.hasSuccess();
  });

  it(`Configure and edit Rubrics Payroll values`, () => {
    Page.editPayrollRubric(employeeName);
  });

  it(`Should set multiple employees On Waiting List of Payroll`, () => {

    element(by.css('[data-method="search"]')).click();

    components.payrollStatusSelect.set(['configuré']);
    searchModalPage.submit();

    GU.selectRow(gridId, 0);
    GU.selectRow(gridId, 1);

    element(by.css('[data-action="open-menu"]')).click();
    element(by.css('[data-method="put-waiting"]')).click();

    components.notification.hasSuccess();

  });

  // @lomamech to do how to check the Payslip View

});
