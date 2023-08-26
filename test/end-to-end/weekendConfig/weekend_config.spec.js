const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

const WeekendConfigPage = require('./weekend_config.page');

test.describe('Weekend Configuration Management', () => {

  const page = new WeekendConfigPage();

  test.beforeEach(async () => {
    await TU.navigate('#!/payroll/weekend_configuration');
  });

  const newWeekendConfigLabel = 'Configuration Weekend 2013';
  const updateWeekendConfigLabel = 'Configuration Weekend 2013 Updated';

  test('successfully creates a new weekend configuration', async () => {
    await page.create(newWeekendConfigLabel);
  });

  test('successfully edits a weekend configuration', async () => {
    await page.update(newWeekendConfigLabel, updateWeekendConfigLabel);
  });

  test('do not create an incorrect weekend', async () => {
    await page.errorOnCreateWeekendConfig();
  });

  test('successfully deletes a weekend', async () => {
    await page.remove(updateWeekendConfigLabel);
  });
});
