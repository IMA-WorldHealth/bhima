const helpers = require('../shared/helpers');
const RolesPage = require('./roles.page');
const components = require('../shared/components');

// the page object
const page = new RolesPage();
const canEditRoleAction = 'FORM.LABELS.CAN_EDIT_ROLES';

function RolesManagementTests() {

  // navigate to the page
  before(() => helpers.navigate('#/roles'));

  it('should add a new role', async () => {
    await page.openCreateModal();
    await page.setLabel('Secretaire');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should add a edit role', async () => {
    await page.editRole('Secretaire');
    await page.setLabel('Sécretaire');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should edit permissions for a role', async () => {
    await page.editPermissions('Sécretaire');
    await page.checkAllPermissions();
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should add a test role', async () => {
    await page.openCreateModal();
    await page.setLabel('Test Role');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should delete the test role', async () => {
    await page.deleteRole('Test Role');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should assign an action to a role', async () => {
    await page.assignActions('Regular');
    await page.setAction(canEditRoleAction);
    await page.submit();
    await components.notification.hasSuccess();
  });
}

function assigningRole() {
  // navigate to user page in order to assign a role to a user
  before(() => helpers.navigate('#/users'));

  it('should assign a role to a user', async () => {
    await page.assignRole('Super User');
    await page.setRole(`Sécretaire`);
    await page.submit();
    await components.notification.hasSuccess();
  });
}

describe('Role Management Tests', () => {
  describe('Role Management', RolesManagementTests);
  describe('Role Assignment', assigningRole);
});
