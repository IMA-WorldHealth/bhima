const BedPage = require('./bed.page');
const helpers = require('../../shared/helpers');
const components = require('../../shared/components');

// the page object
const page = new BedPage();

function BedManagementTests() {

  // navigate to the page
  before(() => helpers.navigate('#/ward/configuration'));

  const bed = 'PA.RA.001';

  it('should add a new Bed', () => {
    page.openCreateModal();
    page.setWard('Pavillon A');
    page.setRoom('Room A in Ward A');
    page.setLabel(bed);
    page.submit();
    components.notification.hasSuccess();
  });

  it('should not add a new Bed without ward', () => {
    page.openCreateModal();
    page.setLabel(bed.concat(' without ward'));
    page.submit();
    page.wardValidationError();
    page.cancel();
  });

  it('should edit Bed', () => {
    page.editBed(bed);
    page.setWard('Pavillon B');
    page.setRoom('Room B in Ward B');
    page.setLabel(bed.concat(' edited'));
    page.submit();
    components.notification.hasSuccess();
  });

  it('should delete the test Bed', () => {
    page.deleteBed(bed.concat(' edited'));
    page.submit();
    components.notification.hasSuccess();
  });

}

describe('Bed Management Tests', BedManagementTests);
