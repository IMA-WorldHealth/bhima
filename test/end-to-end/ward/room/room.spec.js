
const RoomPage = require('./room.page');
const helpers = require('../../shared/helpers');
const components = require('../../shared/components');

// the page object
const page = new RoomPage();

function RoomManagementTests() {

  // navigate to the page
  before(() => helpers.navigate('#/ward_module/configuration'));

  const room = 'CH.A.001';

  it('should add a new Room', () => {
    page.openCreateModal();
    page.setWard('Pavillon A');
    page.setLabel(room);
    page.setDescription('Chambre 001 du pavillon A');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should add a new Room without description', () => {
    page.openCreateModal();
    page.setWard('Pavillon A');
    page.setLabel('CH.A.002');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should edit Room', () => {
    page.editRoom(room);
    page.setWard('Pavillon B');
    page.setLabel(room.concat(' edited'));
    page.setDescription('Chambre 001 moved to pavillon B');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should not add a new Room without ward', () => {
    page.openCreateModal();
    page.setLabel('CH.A.003');
    page.submit();
    page.wardValidationError();
    page.cancel();
  });

  it('should delete the test Room', () => {
    page.deleteRoom(room.concat(' edited'));
    page.submit();
    components.notification.hasSuccess();
  });

}

describe('Room Management Tests', RoomManagementTests);
