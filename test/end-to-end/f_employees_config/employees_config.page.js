/* eslint class-methods-use-this:off */
/* global element, by */

const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class EmployeeConfigPage {
  constructor() {
    this.gridId = 'employee-config-grid';
  }

  create(employee) {
    FU.buttons.create();
    FU.input('EmployeeModalCtrl.employee.label', employee.label);

    FU.modal.submit();
    components.notification.hasSuccess();
  }

  errorOnCreateEmployeeConfig() {
    FU.buttons.create();
    FU.modal.submit();
    FU.validation.error('EmployeeModalCtrl.employee.label');
    FU.modal.cancel();
  }

  update(label, updateEmployeeConfig) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.edit().click();

    FU.input('EmployeeModalCtrl.employee.label', updateEmployeeConfig.label);

    FU.modal.submit();
    components.notification.hasSuccess();
  }

  /**
   * simulate a click on the Configure link of a function
   */
  setEmployeeConfig(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.method('config').click();

    element(by.id('all')).click();

    FU.modal.submit();
    components.notification.hasSuccess();
  }

  /**
   * simulate a click on the Configure link of a function for Inset Employee
   */
  unsetEmployeeConfig(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.method('config').click();

    // First click for select all
    element(by.id('all')).click();

    // Second click for unselect all
    element(by.id('all')).click();

    FU.modal.submit();
    components.notification.hasSuccess();
  }

  remove(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.remove().click();

    components.modalAction.confirm();
    components.notification.hasSuccess();
  }
}

module.exports = EmployeeConfigPage;
