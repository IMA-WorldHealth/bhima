const helpers = require('../shared/helpers');
const DonorsPage = require('./donor.page');
const components = require('../shared/components');

// the page object
const page = new DonorsPage();

function donorsManagementTests() {

  // navigate to the page
  before(() => helpers.navigate('#/donors'));

  it('should add a new donor', async () => {
    await page.openCreateModal();
    await page.setName('DFD');
    await page.setEmail('dfid@imaworld.com');
    await page.setPhone('+100000202');
    await page.setAddress('232 USA ..');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should add a edit donor', async () => {
    await page.editDonor('DFD');
    await page.setName('DFID');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should add a test donor', async () => {
    await page.openCreateModal();
    await page.setName('Test donor');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should delete the test donor', async () => {
    await page.deleteDonor('Test donor');
    await page.submit();
    await components.notification.hasSuccess();
  });

}

describe('donor Management Tests', () => {
  describe('donor Management', donorsManagementTests);
});
