// eslint-disable-next-line import/no-extraneous-dependencies
const { test, expect } = require('@playwright/test');

test.beforeAll(async ({ browser }) => {

  // Login once for all following tests
  const page = await browser.newPage();
  await page.goto('http://localhost:8080/#!/login');
  expect(page).toHaveTitle(/BHIMA/);

  await page.getByPlaceholder('Enter your username').fill('superuser');
  await page.getByPlaceholder('Enter your password').fill('superuser');

  // await page.locator('[ng-model="LoginCtrl.credentials.username"]').sendKeys('superuser');
  // await page.locator('[ng-model="LoginCtrl.credentials.password"]').sendKeys('superuser');

  // await browser.get('http://localhost:8080/#!/login');

  // // Turns off ng-animate animations for all elements in the
  // await element(by.css('body')).allowAnimations(false);

  // element(by.model('...')) ==>	page.locator('[ng-model="..."]')

  // await element(by.model('LoginCtrl.credentials.username')).sendKeys('superuser');
  // await element(by.model('LoginCtrl.credentials.password')).sendKeys('superuser');
  // await element(by.css('[data-method="submit"]')).click();

  // const uname = await page.getByLabel('username');
  // console.log("Uname: ", uname);
  // await page.getByLabel('username').fill('superuser');
  // await page.getByRole('input', { name : 'username' }).fill('superuser');
  // await page.getByPlaceholder('Enter your username').fill('superuser');

  // await page.getByLabel('password').fill('superuser');
  // await page.getByText('Log in').click();

  // await page.getByRole('button', { name: 'Sign in' }).click();
});

test('verify we are logged in', async ({ page }) => {
  // console.log("-> page: ", Object.getOwnPropertyNames(page));
  // console.debug('FNS: ', Object.getOwnPropertyNames(Object.getPrototypeOf(<OBJ>)));
  await page.goto('http://localhost:8080');
  await expect(page).toHaveTitle(/BHIMA/);

  // Check the project name to make sure we are logged in
  // await expect(page.getByTestId('header-title')).toHaveText('TEST PROJECT A');
});
