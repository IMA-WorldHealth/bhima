const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

const components = require('../shared/components');

test.describe('transaction types', () => {

  test.beforeEach(async () => {
    await TU.navigate('/#!/transaction_type');
  });

  const newType = {
    text        : 'E2E Transaction Type',
    type        : 'Income',
  };

  const updateType = {
    text        : 'E2E Transaction Type updated',
    type        : 'Expenses',
  };

  const otherType = {
    text        : 'E2E Other Transaction Type',
    type        : 'Other',
  };

  test('successfully creates a transaction type', async () => {
    await TU.buttons.create();
    await TU.input('$ctrl.transactionType.text', newType.text);
    await TU.select('$ctrl.transactionType.type', newType.type);
    await TU.buttons.submit();
    await components.notification.hasSuccess();
  });

  test('successfully updates an existing transaction type', async () => {
    await TU.locator(`[data-edit-type="${newType.text}"]`).click();
    await TU.input('$ctrl.transactionType.text', updateType.text);
    await TU.select('$ctrl.transactionType.type', updateType.type);
    await TU.buttons.submit();
    await components.notification.hasSuccess();
  });

  test('successfully creates a transaction type with a specific type', async () => {
    await TU.buttons.create();
    await TU.input('$ctrl.transactionType.text', otherType.text);
    await TU.select('$ctrl.transactionType.type', updateType.type);
    await TU.buttons.submit();
    await components.notification.hasSuccess();
  });

  test('do not create a new transaction type for missing type', async () => {
    await TU.buttons.create();
    await TU.locator(by.model('$ctrl.transactionType.type')).click();
    await TU.buttons.submit();

    // check validations
    await TU.validation.error('$ctrl.transactionType.type');

    await TU.modal.cancel();
    await components.notification.hasDanger();
  });

  test('do not create a new transaction type for missing required values', async () => {
    await TU.buttons.create();
    await TU.buttons.submit();

    // check validations
    await TU.validation.error('$ctrl.transactionType.text');
    await TU.validation.error('$ctrl.transactionType.type');

    await TU.modal.cancel();
    await components.notification.hasDanger();
  });
});
