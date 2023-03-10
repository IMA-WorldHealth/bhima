const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');

test.beforeEach(async ({ page }) => {
  TU.registerPage(page);
});

test('verify we can log in', async ({ page }) => {

  await TU.login();

  // Check the project title to verify that we are logged in
  expect(await page.innerText('.title-content')).toBe('Test Project A');

  await TU.logout();

  // Verify that we have logged out
  expect(await page.innerText('div.panel-heading')).toBe('Login');
});

// console.debug('B: ', Object.getOwnPropertyNames(page));
// console.table(Object.getOwnPropertyNames(Object.getPrototypeOf(page)).sort());