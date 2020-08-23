const helpers = require('../shared/helpers');
const TagPage = require('./tags.page');
const components = require('../shared/components');

// the page object
const page = new TagPage();

function tagsManagementTests() {

  // navigate to the page
  before(() => helpers.navigate('#/tags'));

  it('should add a new tags', async () => {
    await page.openCreateModal();
    await page.setName('Tag1');
    await page.setColor('Aqua');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should add another tags', async () => {
    await page.openCreateModal();
    await page.setName('Broken');
    await page.setColor('Gris');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should add a third tags', async () => {
    await page.openCreateModal();
    await page.setName('Test tag');
    await page.setColor('Vert');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should edit tags', async () => {
    await page.editTags('Tag1');
    await page.setName('Repaired');
    await page.setColor('Jaune');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should delete the test tags', async () => {
    await page.deleteTags('Test tag');
    await page.submit();
    await components.notification.hasSuccess();
  });

}

describe('tags Management Tests', tagsManagementTests);
