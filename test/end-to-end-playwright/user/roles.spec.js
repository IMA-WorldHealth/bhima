const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const RolesPage = require('./roles.page');
const components = require('../shared/components');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

// the page object
const page = new RolesPage();
const canEditRoleAction = 'FORM.LABELS.CAN_EDIT_ROLES';

test.describe('Role Management Tests', () => {

  test.describe('Role Management', () => {
    test.beforeEach(async () => {
      await TU.navigate('/#!/roles');
    });

    test('should add a new role', async () => {
      await page.openCreateModal();
      await page.setLabel('Secretaire');
      await page.submit();
      await components.notification.hasSuccess();
    });

    test('should add a edit role', async () => {
      await page.editRole('Secretaire');
      await page.setLabel('Sécretaire');
      await page.submit();
      await components.notification.hasSuccess();
    });

    test('should edit permissions for a role', async () => {
      await page.editPermissions('Sécretaire');
      await page.checkAllPermissions();
      await page.submit();
      await components.notification.hasSuccess();
    });

    test('should add a test role', async () => {
      await page.openCreateModal();
      await page.setLabel('Test Role');
      await page.submit();
      await components.notification.hasSuccess();
    });

    test('should delete the test role', async () => {
      await page.deleteRole('Test Role');
      await page.submit();
      await components.notification.hasSuccess();
    });

    test('should assign an action to a role', async () => {
      await page.assignActions('Regular');
      await page.setAction(canEditRoleAction);
      await page.submit();
      await components.notification.hasSuccess();
    });
  });

  test.describe('Role Assignment', () => {

    test.beforeEach(async () => {
      await TU.navigate('/#!/users');
    });

    test('should assign a role to a user', async () => {
      await page.assignRole('Super User');
      await page.setRole(`Sécretaire`);
      await page.submit();
      await components.notification.hasSuccess();
    });
  });

});
