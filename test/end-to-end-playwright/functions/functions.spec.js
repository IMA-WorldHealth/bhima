const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const { notification } = require('../shared/components');
const FunctionPage = require('./functions.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Job Titles Management', () => {
  test.beforeEach(async () => {
    await TU.navigate('/#!/functions');
  });

  const page = new FunctionPage();

  const newProfession = 'Comptable';
  const updateProfession = 'Chef Comptable';

  test('successfully creates a new job title', async () => {
    await page.create(newProfession);
    await notification.hasSuccess();
  });

  test('successfully edits a job title', async () => {
    await page.update(newProfession, updateProfession);
    await notification.hasSuccess();
  });

  test('errors when missing job tit create when incorrect job title', async () => {
    await page.errorOnCreateFunction();
  });

  test('successfully delete a job title', async () => {
    await page.remove(updateProfession);
    await notification.hasSuccess();
  });
});
