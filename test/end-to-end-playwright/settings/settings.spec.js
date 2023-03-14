const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');

test.beforeEach(async ({ page }) => {
  TU.registerPage(page);
  await page.goto('/#!/login');
  await TU.login();
  await page.goto('/#!/settings');
});

test.describe('Settings Tests', () => {

  test('loads the page, and selects a language', async ({ page }) => {
    // confirm that we can change the languages (to French)
    // ideally, we should check that the language changed, but this
    // test should only confirm that things are open.
    await page.click('#select-language'); // Expose the drop-down
    await TU.select('SettingsCtrl.settings.language', 'Francais');

    // SEE https://www.programsbuzz.com/article/how-handle-dropdown-playwright
  });

});
