/* global element, by */
const helpers = require('../shared/helpers');
const PayrollProcessPage = require('./payroll_process.page');
const SearchModalPage = require('./searchModal.page.js');
const GU = require('../shared/GridUtils');
const components = require('../shared/components');


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

  const employeeRef = 'EM.TE.1'; // TEST 2 PATIENT

  const gridId = 'multipayroll-grid';

  it(`should find Default Employee In Default Payroll Period`, async () => {
    await searchModalPage.payrollPeriod(defaultValue.period);
    await searchModalPage.selectCurrency(defaultValue.currency);
    await searchModalPage.submit();
    await Page.getEmployeeCount(employeeCount, `The number of Defined employee should be ${employeeCount}`);
  });

  it(`should configure multiple employees for payment`, async () => {
    await GU.selectRow(gridId, 0);

    await element(by.css('[data-action="open-menu"]')).click();
    await element(by.css('[data-method="configure-payment"]')).click();

    await components.notification.hasSuccess();
  });

  it(`Configure and edit Rubrics Payroll values`, async () => {
    await Page.editPayrollRubric(employeeRef);
  });

  it(`should set multiple employees on waiting list of payroll`, async () => {
    await element(by.css('[data-method="search"]')).click();

    await components.payrollStatusSelect.set(['configuré']);
    await searchModalPage.submit();

    await GU.selectRow(gridId, 0);
    await GU.selectRow(gridId, 1);

    await element(by.css('[data-action="open-menu"]')).click();
    await element(by.css('[data-method="put-waiting"]')).click();

    await components.notification.hasSuccess();
  });

  // @lomamech to do how to check the Payslip View
});
