const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const TagPage = require('./tags.page');
const components = require('../shared/components');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('tags Management Tests', () => {

  // the page object
  const page = new TagPage();

  test.beforeEach(async () => {
    await TU.navigate('#/tags');
  });

  test('should add a new tags', async () => {
    await page.openCreateModal();
    await page.setName('Tag1');
    await page.setColor('Aqua');
    await page.submit();
    await components.notification.hasSuccess();
  });

  test('should add another tags', async () => {
    await page.openCreateModal();
    await page.setName('Broken');
    await page.setColor('Gray');
    await page.submit();
    await components.notification.hasSuccess();
  });

  test('should add a third tags', async () => {
    await page.openCreateModal();
    await page.setName('Test tag');
    await page.setColor('green');
    await page.submit();
    await components.notification.hasSuccess();
  });

  test('should edit tags', async () => {
    await page.editTags('Tag1');
    await page.setName('Repaired');
    await page.setColor('Yellow');
    await page.submit();
    await components.notification.hasSuccess();
  });

  test('should delete the test tags', async () => {
    await page.deleteTags('Test tag');
    await page.submit();
    await components.notification.hasSuccess();
  });

});
