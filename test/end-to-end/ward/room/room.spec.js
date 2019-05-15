
const RoomPage = require('./room.page');
const helpers = require('../../shared/helpers');
const components = require('../../shared/components');

// the page object
const page = new RoomPage();

function RoomManagementTests() {

  // navigate to the page
  before(() => helpers.navigate('#/ward/configuration'));

  const room = 'CH.A.001';

  it('should add a new Room', async () => {
    await page.openCreateModal();
    await page.setWard('Pavillon A');
    await page.setLabel(room);
    await page.setDescription('Chambre 001 du pavillon A');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should add a new Room without description', async () => {
    await page.openCreateModal();
    await page.setWard('Pavillon A');
    await page.setLabel('CH.A.002');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should edit Room', async () => {
    await page.editRoom(room);
    await page.setWard('Pavillon B');
    await page.setLabel(room.concat(' edited'));
    await page.setDescription('Chambre 001 moved to pavillon B');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should not add a new Room without ward', async () => {
    await page.openCreateModal();
    await page.setLabel('CH.A.003');
    await page.submit();
    await page.wardValidationError();
    await page.cancel();
  });

  it('should delete the test Room', async () => {
    await page.deleteRoom(room.concat(' edited'));
    await page.submit();
    await components.notification.hasSuccess();
  });
}

describe('Room Management Tests', RoomManagementTests);
