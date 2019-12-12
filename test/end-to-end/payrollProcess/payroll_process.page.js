/* global element, by */
/* eslint  */

/**
 * This class is represents a Payroll Process Page in term of structure and
 * behaviour so it is a Payroll Process Page object
 */

const grid = require('../shared/GridUtils');

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
  async getEmployeeCount(number, message) {
    await grid.expectRowCount(this.gridId, number, message);
  }

  async editPayrollRubric(label) {
    const { rowIndex } = await GU.getGridIndexesMatchingText(this.gridId, label);
    await GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'config', this.gridId);

    await components.currencyInput.set(120, 'TPR');
    await components.currencyInput.set(150, 'PRI');
    await components.currencyInput.set(100, 'v_cher');
    await components.currencyInput.set(100, 'f_scol');
    await components.currencyInput.set(200, 'allc');
    await components.currencyInput.set(0, 'ac_sal');
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  async errorEditPayrollRubric(label) {
    const { rowIndex } = await GU.getGridIndexesMatchingText(this.gridId, label);
    await GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'config', this.gridId);

    await FU.buttons.submit();
    await components.notification.hasDanger();
  }
}

module.exports = PayrollProcessPage;
