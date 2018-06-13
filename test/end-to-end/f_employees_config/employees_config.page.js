/* global element, by */

/**
 * This class is represents a employee Configuration page in term of structure and
 * behaviour so it is a employee configuration page object
 */

const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

/* loading grid actions */
const GA = require('../shared/GridAction');
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class EmployeeConfigPage {
  constructor() {
    this.gridId = 'employee-config-grid';
    this.employeeGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 1;
  }

  /**
   * send back the number of employees in the grid
   */
  getEmployeeConfigCount() {
    return this.employeeGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  /**
   * simulate the create employee Configuration button click to show the dialog of creation
   */
  createEmployeeConfig(employee) {
    FU.buttons.create();
    FU.input('EmployeeModalCtrl.employee.label', employee.label);

    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  errorOnCreateEmployeeConfig() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('EmployeeModalCtrl.employee.label');
    FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  editEmployeeConfig(label, updateEmployeeConfig) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
        FU.input('EmployeeModalCtrl.employee.label', updateEmployeeConfig.label);

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the Configure link of a function
   */
  setEmployeeConfig(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'config', this.gridId);
        element(by.id('all')).click();
        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the Configure link of a function for Inset Employee
   */
  inSetEmployeeConfig(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'config', this.gridId);
        // First click for select all
        element(by.id('all')).click();

        // Second click for unselect all        
        element(by.id('all')).click();
        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the delete link of a function
   */
  deleteEmployeeConfig(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'delete', this.gridId);
        components.modalAction.confirm();
        components.notification.hasSuccess();
      });
  }
}

module.exports = EmployeeConfigPage;
