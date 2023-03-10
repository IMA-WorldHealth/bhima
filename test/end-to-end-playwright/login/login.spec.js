const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');

// console.debug('B: ', Object.getOwnPropertyNames(page));
// console.table(Object.getOwnPropertyNames(Object.getPrototypeOf(page)).sort());

// test.beforeEach(async ({ page }) => {
//   console.log(`Logging into the BHIMA server`);

//   await page.goto('http://localhost:8080/#!/login');
//   expect(page).toHaveTitle(/BHIMA/);

//   // First, switch to English
//   expect((await page.innerText('li[role=menuitem]:last-child > a')).trim()).toBe('English');
//   await page.click('div.panel-heading > div.dropdown > a'); // Expose the language drop-down menu
//   await page.click('li[role=menuitem]:last-child > a'); // Click on the English option
//   expect(await page.innerText('.panel-heading')).toBe('Login');

//   // Log in
//   await page.fill('input[name=username]', 'superuser');
//   await page.fill('input[name=password]', 'superuser');
//   await page.click('button[type=submit]');
//   await page.waitForURL('http://localhost:8080/#!/');
// });

// test.afterEach(async ({ page }) => {
//   // Log out
//   console.log(`Logging out of the BHIMA server`);

//   await page.goto('http://localhost:8080/#!/settings');
//   await page.waitForURL('http://localhost:8080/#!/settings');

//   await page.click('button[ng-click="SettingsCtrl.logout()"]');
//   await page.waitForURL('http://localhost:8080/#!/login');

//   // Verify that we have logged out
//   expect(await page.innerText('div.panel-heading')).toBe('Login');
// });

test('verify we can log in', async ({ page }) => {
  await TU.login(page);

  // Check the project title to verify that we are logged in
  expect(await page.innerText('.title-content')).toBe('Test Project A');

  await TU.logout(page);

  // Verify that we have logged out
  expect(await page.innerText('div.panel-heading')).toBe('Login');
});
