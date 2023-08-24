const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../../shared/TestUtils');

const WardPage = require('./ward.page');
const components = require('../../shared/components');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Ward Management Tests', () => {

  const page = new WardPage();

  // navigate to the page
  test.beforeEach(async () => {
    await TU.navigate('/#!/ward/configuration');
  });

  test('should add a new Ward', async () => {
    await page.openCreateModal();
    await page.setName('Ward accouchement');
    await page.submit();
    await components.notification.hasSuccess();
  });

  test('should add another new Ward', async () => {
    await page.openCreateModal();
    await page.setName('Ward 1');
    await page.submit();
    await components.notification.hasSuccess();
  });

  test('should add a new Ward linked to a service', async () => {
    await page.openCreateModal();
    await page.setName('Ward linked to a service');
    await page.selectService('Medecine Interne');
    await page.submit();
    await components.notification.hasSuccess();
  });

  test('should add a new Ward with a description', async () => {
    await page.openCreateModal();
    await page.setName('Test');
    await page.setDescription('Ward description');
    await page.submit();
    await components.notification.hasSuccess();
  });

  test('should edit Ward', async () => {
    await page.editWard('Ward 1');
    await page.setName('Ward A');
    await page.setDescription('Ward updated');
    await page.submit();
    await components.notification.hasSuccess();
  });

  test('should delete the test Ward', async () => {
    await page.deleteWard('Test');
    await page.submit();
    await components.notification.hasSuccess();
  });

});
