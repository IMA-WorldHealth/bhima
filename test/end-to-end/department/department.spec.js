const helpers = require('../shared/helpers');
const RolesPage = require('./department.page');
const components = require('../shared/components');

// the page object
const page = new RolesPage();

function DepartmentManagementTests() {

  // navigate to the page
  before(() => helpers.navigate('#/departments'));

  it('should add a new department', () => {
    page.openCreateModal();
    page.setLabel('Computer Science');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should add a new department', () => {
    page.openCreateModal();
    page.setLabel('HR');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should add a new department', () => {
    page.openCreateModal();
    page.setLabel('Test');
    page.submit();
    components.notification.hasSuccess();
  });

  it('should edit department', () => {
    page.editDepartment('HR');
    page.setLabel('Human Resource');
    page.submit();
    components.notification.hasSuccess();
  });


  it('should delete the test department', () => {
    page.deleteDepartment('Test');
    page.submit();
    components.notification.hasSuccess();
  });

}

describe('Department Management Tests', DepartmentManagementTests);
