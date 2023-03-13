const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');

test.beforeEach(async ({ page }) => {
  TU.registerPage(page);
  await page.goto('http://localhost:8080/#!/login');
});

test.afterEach(async ({ page }) => {
  TU.logout();
});

test('verify we can log in', async ({ page }) => {

  await TU.login();

  // Check the project title to verify that we are logged in
  expect(await page.innerText('.title-content')).toBe('Test Project A');

  await TU.logout();

  // Verify that we have logged out
  expect(await page.innerText('div.panel-heading')).toBe('Login');
});

test('rejects an invalid username/password combo with (only) a growl notification', async ({ page }) => {
  await TU.input('LoginCtrl.credentials.username', 'undefineds');
  await TU.input('LoginCtrl.credentials.password', 'undefined1');
  await TU.buttons.submit();

  // Verify that we get a warning message
  await page.waitForSelector('[data-notification-type="notification-danger"]');

  // Verify that we have not logged in
  expect(await page.url()).toBe('http://localhost:8080/#!/login');
});

test('has a default project value', async ({ page }) => {

  const projectOptions = await page.waitForSelector('select[name="project"]');
  const defaultProject = (await projectOptions.$('option:checked')).innerText();

  expect(defaultProject.length > 0);
});

// console.debug('B: ', Object.getOwnPropertyNames(page));
// console.table(Object.getOwnPropertyNames(Object.getPrototypeOf(page)).sort());