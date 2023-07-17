const moment = require('moment');
const { chromium } = require('@playwright/test');
const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

const components = require('../shared/components');

test.describe('Fiscal Year', () => {
  const path = '/#!/fiscal';
  const pathNew = '/#!/fiscal/create';

  // Compute the current year
  const currentYear = (moment(Date.now()).year()).toString();
  const newFY = (parseInt(currentYear, 10) + 1).toString();

  test.beforeEach(async () => {
    await TU.navigate(path);
  });

  const fiscalYear = {
    label    : 'A Special Fiscal Year',
    note     : 'Note for the new fiscal Year',
    // previous : currentYear.toString(),
    previous : `Fiscal Year 2023(01 Jan 2023 - 31 Dec 2023`,
  };

  test('blocks invalid form submission with relevant error classes', async () => {
    // switch to the create form
    await TU.buttons.create();
    await TU.waitForSelector('form[name="FiscalForm"]');

    // verify form has not been successfully submitted
    expect(await TU.getCurrentPath()).toBe(pathNew);

    // set invalid date range to test `number_of_months`
    await components.dateInterval.range('01/02/2016', '01/01/2016');

    await TU.buttons.submit();

    // the following fields should be required
    await TU.validation.error('FiscalManageCtrl.fiscal.label');
    await TU.validation.error('FiscalManageCtrl.fiscal.number_of_months');

    await components.notification.hasDanger();
  });

  test('creates a new Fiscal Year', async () => {
    // switch to the create form
    await TU.buttons.create();
    await TU.waitForSelector('form[name="FiscalForm"]');

    await TU.input('FiscalManageCtrl.fiscal.label', fiscalYear.label);

    // select the proper date
    await components.dateInterval.range(`01/01/${newFY}`, `31/12/${newFY}`);
    await TU.select('FiscalManageCtrl.fiscal.previous_fiscal_year_id', fiscalYear.previous);

    // model, label, anchor
    await TU.input('FiscalManageCtrl.fiscal.note', fiscalYear.note);
    await TU.buttons.submit();

    await components.notification.hasSuccess();
  });

  test('edits a fiscal year', async () => {
    await TU.locator('[data-fiscal-entry] [data-method="update"]').first().click();

    // modify the fiscal year label and note
    await TU.input('FiscalManageCtrl.fiscal.label', `Test Fiscal Year ${newFY} (update)`);
    await TU.input('FiscalManageCtrl.fiscal.note', `Test ${newFY} [update]`);

    await TU.buttons.submit();
    await components.notification.hasSuccess();
  });

  test('delete a fiscal Year', async () => {
    await TU.locator('[data-fiscal-entry] [data-method="delete"]').first().click();

    // click the alert asking for permission
    await components.modalAction.confirm();
    await components.notification.hasSuccess();
  });

  test('set the opening balance for the first fiscal year', async () => {
    // the last in the list is the oldest
    await TU.locator('.pagination-last > a').click();
    await TU.locator('[data-fiscal-entry] [data-method="update"]').last().click();

    // click on the opening balance button
    await TU.locator('[data-action="opening-balance"]').click();
    await TU.waitForSelector('div.ui-grid-footer');

    // actions in the grid
    const account1 = 85;
    const account2 = 89;
    const account3 = 83;

    await TU.locator(`[data-debit-account="${account1}"]`).fill('150');
    await TU.locator(`[data-debit-account="${account2}"]`).fill('150');
    await TU.locator(`[data-credit-account="${account3}"]`).fill('300');

    await TU.buttons.submit();
    await components.notification.hasSuccess();
  });

  test('forbid not balanced submission', async () => {
    // await TU.navigate(path);
    await TU.navigate(path);

    // the last in the list is the oldest
    await TU.locator('.pagination-last > a').click();
    await TU.locator('[data-fiscal-entry] [data-method="update"]').last().click();

    // click on the opening balance button
    await TU.locator('[data-action="opening-balance"]').click();
    await TU.waitForSelector('div.ui-grid-footer');

    // actions in the grid
    const account1 = 85;
    const account2 = 89;
    const account3 = 83;

    await TU.locator(`[data-debit-account="${account1}"]`).fill('150');
    await TU.locator(`[data-debit-account="${account2}"]`).fill('150');
    await TU.locator(`[data-credit-account="${account3}"]`).fill('200');
    await TU.buttons.submit();
    await components.notification.hasDanger();
    expect(await TU.isPresent('[data-status="not-balanced"]')).toBe(true);
  });

  test('closing a fiscal year in normal way', async () => {
    await TU.navigate(path);

    // the last in the list is the oldest
    await TU.locator('.pagination-last > a').click();
    await TU.locator('[data-fiscal-entry] [data-method="update"]').last().click();

    // this fix multiple element found take first
    const submitButton = TU.locator('[data-method="submit"]').first();

    // click on the opening balance button
    await TU.locator('[data-action="closing-fiscal-year"]').click();

    // inner variables
    const resultAccount = '13110001'; // 13110001 -Résusltat de l\'exercise

    // set the result account
    await components.accountSelect.set(resultAccount);

    // submit to next step
    await submitButton.click();

    // submit to confirm info
    await submitButton.click();

    // submit to confirm the action
    await submitButton.click();

    // check notification
    await components.notification.hasSuccess();
  });
});
