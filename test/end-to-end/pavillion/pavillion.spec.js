
const PavillionPage = require('./pavillion.page');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

// the page object
const page = new PavillionPage();

function PavillionManagementTests() {

  // navigate to the page
  before(() => helpers.navigate('#/pavillions'));

  it('should add a new Pavillion', () => {
    page.openCreateModal();
    page.setName('Pavillion accouchement');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should add a new Pavillion', () => {
    page.openCreateModal();
    page.setName('Pavillion 1');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should add a new Pavillion linked to a service', () => {
    page.openCreateModal();
    page.setName('Pavillion linked to a service');
    page.selectService('Medecine Interne');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should add a new Pavillion', () => {
    page.openCreateModal();
    page.setName('Test');
    page.setDescription('Pavillion description');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should edit Pavillion', () => {
    page.editPavillion('Pavillion 1');
    page.setName('Pavillion A');
    page.setDescription('Pavillion updated');
    page.submit();
    components.notification.hasSuccess();
  });


  it('should delete the test Pavillion', () => {
    page.deletePavillion('Test');
    page.submit();
    components.notification.hasSuccess();
  });

}

describe('Pavillion Management Tests', PavillionManagementTests);
