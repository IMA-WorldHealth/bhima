const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../../shared/TestUtils');

const BedPage = require('./bed.page');
const components = require('../../shared/components');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Bed Management Tests', () => {

  const page = new BedPage();

  test.beforeEach(async () => {
    await TU.navigate('/#/ward/configuration');
  });

  const bed = 'PA.RA.001';

  test('should add a new Bed', async () => {
    await page.openCreateModal();
    await page.setWard('Pavillon A');
    await page.setRoom('Room A in Ward A');
    await page.setLabel(bed);
    await page.submit();
    await components.notification.hasSuccess();
  });

  test('should not add a new Bed without ward', async () => {
    await page.openCreateModal();
    await page.setLabel(bed.concat(' without ward'));
    await page.submit();
    await page.wardValidationError();
    await page.cancel();
  });

  test('should edit Bed', async () => {
    await page.editBed(bed);
    await page.setWard('Pavillon B');
    await page.setRoom('Room B in Ward B');
    await page.setLabel(bed.concat(' edited'));
    await page.submit();
    await components.notification.hasSuccess();
  });

  test('should delete the test Bed', async () => {
    await page.deleteBed(bed.concat(' edited'));
    await page.submit();
    await components.notification.hasSuccess();
  });

});
