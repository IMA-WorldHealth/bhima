
const WardPage = require('./ward.page');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

// the page object
const page = new WardPage();

function WardManagementTests() {

  // navigate to the page
  before(() => helpers.navigate('#/wards'));

  it('should add a new Ward', () => {
    page.openCreateModal();
    page.setName('Ward accouchement');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should add a new Ward', () => {
    page.openCreateModal();
    page.setName('Ward 1');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should add a new Ward linked to a service', () => {
    page.openCreateModal();
    page.setName('Ward linked to a service');
    page.selectService('Medecine Interne');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should add a new Ward', () => {
    page.openCreateModal();
    page.setName('Test');
    page.setDescription('Ward description');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should edit Ward', () => {
    page.editWard('Ward 1');
    page.setName('Ward A');
    page.setDescription('Ward updated');
    page.submit();
    components.notification.hasSuccess();
  });


  it('should delete the test Ward', () => {
    page.deleteWard('Test');
    page.submit();
    components.notification.hasSuccess();
  });

}

describe('Ward Management Tests', WardManagementTests);
