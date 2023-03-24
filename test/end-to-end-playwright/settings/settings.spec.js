const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');

// routes used in tests
const settings = 'settings';

test.describe('Settings', () => {

  test.beforeEach(async ({ page }) => {
    TU.registerPage(page);
    await TU.login();
    await TU.navigate(settings);
  });

  test('loads the page, and selects a language', async ({ page }) => {
    // confirm that we can change the languages (to French)
    await page.locator('#select-language').selectOption('string:fr');
    expect(await page.locator('label[for="select-language"]').innerText()).toBe('Langue');
  });

  test('uses the back button to return to previous state', async ({ page }) => {
    const start = '/#!/';

    // load the settings page w/o backwards navigation
    await TU.navigate(start);
    await TU.navigate('settings');
    expect(TU.getCurrentPath()).toBe('/#!/settings');

    // Ensure we can navigate back to the main page with the back button.

    // click the back button
    await page.locator('[data-back-button]').click();

    // ensure we navigate back to the main page.
    expect(TU.getCurrentPath()).toBe(start);
  });

});
