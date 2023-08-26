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

  // @TODO : Fix; works alone and locally, fails in CI
  test.skip(`should find Default Employee In Default Payroll Period`, async () => {
    // Wait for modal dialog to appear (or open it)
    const modalUp = await TU.isPresent('.modal-dialog');
    if (!modalUp) {
      await TU.buttons.search();
      await TU.waitForSelector('.modal-dialog');
    }
    await searchModalPage.payrollPeriod(defaultValue.period);
    await searchModalPage.selectCurrency(defaultValue.currency);
    await searchModalPage.submit();

    // Make sure the grid is loaded
    await TU.waitForSelector('.ui-grid-canvas .ui-grid-row');
    await page.checkEmployeeCount(employeeCount, `The number of Defined employee should be ${employeeCount}`);
  });

  // @TODO : Fix; works alone and locally, fails in CI
  test.skip(`should configure multiple employees for payment`, async () => {
    // Make sure the grid is loaded
    await TU.waitForSelector('.ui-grid-canvas .ui-grid-row');
    await GU.selectRow(gridId, 0);

    await TU.locator('[data-action="open-menu"]').click();
    await TU.locator('[data-method="configure-payment"]').click();

    await components.notification.hasSuccess();
  });

  // @TODO : Fix; works alone and locally, fails in CI
  test.skip(`Configure and edit Rubrics Payroll values`, async () => {
    // Make sure the grid is loaded
    await TU.waitForSelector('.ui-grid-canvas .ui-grid-row');
    await page.editPayrollRubric(employeeRef);
  });

  // @TODO: Fix.  Works alone but fails with other tests
  test.skip(`should set multiple employees on waiting list of payroll`, async () => {
    await TU.buttons.search();

    await components.payrollStatusSelect.set(['Configured']);
    await searchModalPage.submit();

    // Make sure the grid is loaded
    await TU.waitForSelector('.ui-grid-canvas .ui-grid-row');

    await GU.selectRow(gridId, 0);
    await GU.selectRow(gridId, 1);

    await TU.locator('[data-action="open-menu"]').click();
    await TU.locator('[data-method="put-waiting"]').click();

    await components.notification.hasSuccess();
  });

  // @todo: how to check the Payslip View?
});
