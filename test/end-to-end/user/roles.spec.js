const helpers = require('../shared/helpers');
const RolesPage = require('./roles.page');
const components = require('../shared/components');

// the page object
const page = new RolesPage();
const canEditRoleAction = 1;

function RolesManagementTests() {

  // navigate to the page
  before(() => helpers.navigate('#/roles'));

  it('should add a new role', () => {
    page.openCreateModal();
    page.setLabel('Secretaire');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should add a edit role', () => {
    page.editRole('Secretaire');
    page.setLabel('Sécretaire');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should edit permissions for a role', () => {
    page.editPermissions('Sécretaire');
    page.checkAllPerimission();
    page.submit();
    components.notification.hasSuccess();
  });

  it('should add a test role', () => {
    page.openCreateModal();
    page.setLabel('Test Role');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should delete the test role', () => {
    page.deleteRole('Test Role');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should assign an action to a role', () => {
    page.assignActions('Regular');
    page.setAction(canEditRoleAction);
    page.submit();
    components.notification.hasSuccess();
  });
}

function assigningRole() {
  // navigate to user page in order to assign a role to a user
  before(() => helpers.navigate('#/users'));

  it('should assign a role to a user', () => {
    page.assignRole('Super User');
    page.setRole(`Sécretaire`);
    page.submit();
    components.notification.hasSuccess();
  });
}


describe('Role Management Tests', () => {
  describe('Role Management', RolesManagementTests);
  describe('Role Assignment', assigningRole);
});
