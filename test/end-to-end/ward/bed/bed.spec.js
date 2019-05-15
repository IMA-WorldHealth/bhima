const BedPage = require('./bed.page');
const helpers = require('../../shared/helpers');
const components = require('../../shared/components');

// the page object
const page = new BedPage();

function BedManagementTests() {
  before(() => helpers.navigate('#/ward/configuration'));

  const bed = 'PA.RA.001';

  it('should add a new Bed', async () => {
    await page.openCreateModal();
    await page.setWard('Pavillon A');
    await page.setRoom('Room A in Ward A');
    await page.setLabel(bed);
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should not add a new Bed without ward', async () => {
    await page.openCreateModal();
    await page.setLabel(bed.concat(' without ward'));
    await page.submit();
    await page.wardValidationError();
    await page.cancel();
  });

  it('should edit Bed', async () => {
    await page.editBed(bed);
    await page.setWard('Pavillon B');
    await page.setRoom('Room B in Ward B');
    await page.setLabel(bed.concat(' edited'));
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should delete the test Bed', async () => {
    await page.deleteBed(bed.concat(' edited'));
    await page.submit();
    await components.notification.hasSuccess();
  });
}

describe('Bed Management Tests', BedManagementTests);
