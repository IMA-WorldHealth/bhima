const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const PayrollProcessPage = require('./payroll_process.page');
const SearchModalPage = require('./searchModal.page');
const GU = require('../shared/GridUtils');
const components = require('../shared/components');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Payroll Process Management', () => {

  // navigate to the page
  test.beforeEach(async () => {
    await TU.navigate('/#!/multiple_payroll');
  });

  const page = new PayrollProcessPage();
  const searchModalPage = new SearchModalPage();

  const employeeCount = [2, 6]; // In parallel goes to 6

  const defaultValue = {
    period      : 'Février 2018',
    currency    : 2,
  };

  const employeeRef = 'EM.TE.1'; // TEST 2 PATIENT

  const gridId = 'multipayroll-grid';

  test(`should find Default Employee In Default Payroll Period`, async () => {
    await TU.waitForSelector('.modal-dialog bh-payroll-status-select');
    await searchModalPage.payrollPeriod(defaultValue.period);
    await searchModalPage.selectCurrency(defaultValue.currency);
    await searchModalPage.submit();

    // Make sure the grid is loaded
    await TU.waitForSelector('.ui-grid-canvas .ui-grid-row');
    await page.checkEmployeeCount(employeeCount, `The number of Defined employee should be ${employeeCount}`);
  });

  test(`should configure multiple employees for payment`, async () => {
    // Make sure the grid is loaded
    await TU.waitForSelector('.ui-grid-canvas .ui-grid-row');

    // Select the first employee (unconfigured at this point)
    await GU.selectRow(gridId, 0);

    await TU.locator('[data-action="open-menu"]').click();
    await TU.locator('[data-method="configure-payment"]').click();

    await components.notification.hasSuccess();
  });

  test(`Configure and edit Rubrics Payroll values`, async () => {
    // Make sure the grid is loaded
    await TU.waitForSelector('.ui-grid-canvas .ui-grid-row');
    await page.editPayrollRubric(employeeRef);
  });

  test(`should set multiple employees on waiting list of payroll`, async () => {
    await TU.buttons.search();
    await TU.waitForSelector('.modal-dialog');
    await components.payrollStatusSelect.set(['Configured']);

    // Click on another element to force closing of the search status select drop-down
    await TU.locator('.modal-dialog input[name="display_name"]').click();
    await searchModalPage.submit();

    // Make sure the grid is loaded
    await TU.waitForSelector('.ui-grid-canvas .ui-grid-row');

    await GU.selectRow(gridId, 0);
    await GU.selectRow(gridId, 1);

    await TU.locator('[data-action="open-menu"]').click();
    await TU.locator('[data-method="put-waiting"]').click();

    // Wait for confirmation dialog
    await TU.waitForSelector('.modal-dialog form[name="ModalForm"]');
    await TU.modal.submit();

    await components.notification.hasSuccess();
  });

  // @todo: how to check the Payslip View?
});
