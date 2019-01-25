/* global element, by */

/**
 * This class is represents a Payroll Process Page in term of structure and
 * behaviour so it is a Payroll Process Page object
 */

const chai = require('chai');
const helpers = require('../shared/helpers');
const grid = require('../shared/GridUtils');

helpers.configure(chai);

/* loading grid actions */
const GA = require('../shared/GridAction');
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class PayrollProcessPage {
  constructor() {
    this.gridId = 'multipayroll-grid';
    this.multipayrollGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 5;
  }

  /**
   * send back the number of multipayrolls in the grid
   */
  getEmployeeCount(number, message) {
    grid.expectRowCount(this.gridId, number, message);
  }

  editPayrollRubric(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'config', this.gridId);

        components.currencyInput.set(120, 'TPR');
        components.currencyInput.set(150, 'PRI');
        components.currencyInput.set(100, 'v_cher');
        components.currencyInput.set(100, 'f_scol');
        components.currencyInput.set(200, 'allc');
        components.currencyInput.set(0, 'ac_sal');
        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  errorEditPayrollRubric(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'config', this.gridId);

        FU.buttons.submit();
        components.notification.hasDanger();
      });
  }
}

module.exports = PayrollProcessPage;
