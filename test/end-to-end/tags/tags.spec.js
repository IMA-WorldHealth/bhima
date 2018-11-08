const helpers = require('../shared/helpers');
const RolesPage = require('./tags.page');
const components = require('../shared/components');

// the page object
const page = new RolesPage();

function tagsManagementTests() {

  // navigate to the page
  before(() => helpers.navigate('#/tags'));

  it('should add a new tags', () => {
    page.openCreateModal();
    page.setName('Tag1');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should add another tags', () => {
    page.openCreateModal();
    page.setName('Broken');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should add a third tags', () => {
    page.openCreateModal();
    page.setName('Test tag');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should edit tags', () => {
    page.editTags('Tag1');
    page.setName('Repaired');
    page.submit();
    components.notification.hasSuccess();
  });


  it('should delete the test tags', () => {
    page.deleteTags('Test tag');
    page.submit();
    components.notification.hasSuccess();
  });

}

describe('tags Management Tests', tagsManagementTests);
