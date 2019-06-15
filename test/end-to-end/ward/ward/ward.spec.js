
const WardPage = require('./ward.page');
const helpers = require('../../shared/helpers');
const components = require('../../shared/components');

// the page object
const page = new WardPage();

function WardManagementTests() {

  // navigate to the page
  before(() => helpers.navigate('#/ward/configuration'));

  it('should add a new Ward', async () => {
    await page.openCreateModal();
    await page.setName('Ward accouchement');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should add a new Ward', async () => {
    await page.openCreateModal();
    await page.setName('Ward 1');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should add a new Ward linked to a service', async () => {
    await page.openCreateModal();
    await page.setName('Ward linked to a service');
    await page.selectService('Medecine Interne');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should add a new Ward', async () => {
    await page.openCreateModal();
    await page.setName('Test');
    await page.setDescription('Ward description');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should edit Ward', async () => {
    await page.editWard('Ward 1');
    await page.setName('Ward A');
    await page.setDescription('Ward updated');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should delete the test Ward', async () => {
    await page.deleteWard('Test');
    await page.submit();
    await components.notification.hasSuccess();
  });
}

describe('Ward Management Tests', WardManagementTests);
