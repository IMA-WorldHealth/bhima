const helpers = require('../shared/helpers');
const RolesPage = require('./roles.page');
const components = require('../shared/components');

// the page object
const page = new RolesPage();

function RolesManagementTests() {

  // navigate to the page
  before(() => helpers.navigate('#/roles'));

  it(`Should open create modal `, () => {
    page.openCreateModal();
  });

  it(`Should add a new role`, () => {
    page.setLabel(`Secretaire`);
    page.submit();
  });

  it(`Should add a edit role`, () => {
    page.editRole(2);
    page.setLabel(`Sécretaire`);
    page.submit();
  });

  it(`Should edit permissions for a role`, () => {
    page.editPermissions(2);
    page.checkAllPerimission();
    page.submit();
  });

  it(`Should dismiss the notifaction`, () => {
    page.dismissNotification();
  });

  it(`Should add a third role`, () => {
    page.openCreateModal();
    page.setLabel('test_role');
    page.submit();
  });

  it(`Should delete the third role`, () => {
    page.deleteRole(3);
    page.submit();
  });
}

function assigningRole() {
  // navigate to user page in order to assign a role to a user
  before(() => helpers.navigate('#/users'));

  it(`Shoud assign a role to a user`, () => {
    page.assignRole(2);
    page.setRole(`Sécretaire`);
    page.submit();
    components.notification.hasSuccess();
  });
}

describe('Role management Test', RolesManagementTests);
describe('Role management assigning role', assigningRole);
