const helpers = require('../shared/helpers');
const DepartmentPage = require('./department.page');
const components = require('../shared/components');

// the page object
const page = new DepartmentPage();

function DepartmentManagementTests() {
  before(() => helpers.navigate('#/departments'));

  it('should add a new department', async () => {
    await page.openCreateModal();
    await page.setLabel('Computer Science');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should add a new department', async () => {
    await page.openCreateModal();
    await page.setLabel('HR');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should add a new department', async () => {
    await page.openCreateModal();
    await page.setLabel('Test');
    await page.submit();
    await components.notification.hasSuccess();
  });

  it('should edit department', async () => {
    await page.editDepartment('HR');
    await page.setLabel('Human Resource');
    await page.submit();
    await components.notification.hasSuccess();
  });


  it('should delete the test department', async () => {
    await page.deleteDepartment('Test');
    await page.submit();
    await components.notification.hasSuccess();
  });

}

describe('Department Management Tests', DepartmentManagementTests);
