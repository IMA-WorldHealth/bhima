const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../../shared/TestUtils');

const RoomPage = require('./room.page');
const components = require('../../shared/components');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Room Management Tests', () => {

  // the page object
  const page = new RoomPage();

  // navigate to the page
  test.beforeEach(async () => {
    await TU.navigate('/#!/ward/configuration');
  });

  const room = 'CH.A.001';

  test('should add a new Room', async () => {
    await page.openCreateModal();
    await page.setWard('Pavillon A');
    await page.setLabel(room);
    await page.setDescription('Chambre 001 du pavillon A');
    await page.submit();
    await components.notification.hasSuccess();
  });

  test('should add a new Room without description', async () => {
    await page.openCreateModal();
    await page.setWard('Pavillon A');
    await page.setLabel('CH.A.002');
    await page.submit();
    await components.notification.hasSuccess();
  });

  test('should edit Room', async () => {
    await page.editRoom(room);
    await page.setWard('Pavillon B');
    await page.setLabel(room.concat(' edited'));
    await page.setDescription('Chambre 001 moved to pavillon B');
    await page.submit();
    await components.notification.hasSuccess();
  });

  test('should not add a new Room without ward', async () => {
    await page.openCreateModal();
    await page.setLabel('CH.A.003');
    await page.submit();
    await page.wardValidationError();
    await page.cancel();
  });

  test('should delete the test Room', async () => {
    await page.deleteRoom(room.concat(' edited'));
    await page.submit();
    await components.notification.hasSuccess();
  });

});
