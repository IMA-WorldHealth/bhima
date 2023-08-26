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

test.describe('Exchange Rate', () => {
  const path = '/#!/exchange';

  const DAILY_RATE = 1620;
  const OLD_RATE = 1500;
  const OLD_DATE = new Date('2018-06-01');

  // navigate to the exchange module before running tests
  test.beforeEach(async () => {
    await TU.navigate(path);
  });

  test('set exchange rate for the current date', async () => {
    await TU.locator(by.id('set-exchange')).click();

    await TU.input('ModalCtrl.rate.rate', DAILY_RATE);

    // submit the page to the server
    await TU.buttons.submit();

    await components.notification.hasSuccess();
  });

  test('set exchange rate for an old date', async () => {
    await TU.locator(by.id('set-exchange')).click();

    await components.dateEditor.set(OLD_DATE, null, '[name="rate"]');
    await TU.input('ModalCtrl.rate.rate', OLD_RATE);

    // submit the page to the server
    await TU.buttons.submit();

    await components.notification.hasSuccess();
  });

});
