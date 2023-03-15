const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');

// routes used in tests
const settings = 'settings';
const login = 'login';

test.beforeEach(async ({ page }) => {
  TU.registerPage(page);
  await TU.navigate(login);
});

test.describe('Login Tests', () => {

  test('verify we can log in', async ({ page }) => {
    await TU.login();

    // Check the project title to verify that we are logged in
    expect(await page.innerText('.title-content')).toBe('Test Project A');

    await TU.logout();

    // Verify that we have logged out
    expect(await page.innerText('div.panel-heading')).toBe('Login');
  });

  test('rejects an invalid username/password combo with (only) a growl notification', async ({ page }) => {
    // NOTE: This test should pass even though it generates an 'Unauthorized' console error
    await TU.input('LoginCtrl.credentials.username', 'undefineds');
    await TU.input('LoginCtrl.credentials.password', 'undefined1');
    await TU.buttons.submit();

    // Verify that we get a warning message
    await page.waitForSelector('[data-notification-type="notification-danger"]');

    // Verify that we have not logged in
    expect(page.url().endsWith('/#!/login'));
  });

  test('has a default project value', async ({ page }) => {
    const projectOptions = await page.waitForSelector('select[name="project"]');
    const defaultProject = (await projectOptions.$('option:checked')).innerText();
    expect(defaultProject.length > 0);
  });

  test('page refresh preserves the user session', async ({ page }) => {
    await TU.login();
    await TU.navigate(settings);
    await page.reload();
    const path = await TU.getCurrentPath();
    expect(path.endsWith('/settings'));
  });

});

// console.debug('Page: ', Object.getOwnPropertyNames(page));
// console.table(Object.getOwnPropertyNames(Object.getPrototypeOf(page)).sort());