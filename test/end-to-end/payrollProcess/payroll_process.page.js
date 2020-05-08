/**
 * This class is represents a Payroll Process Page in term of structure and
 * behaviour so it is a Payroll Process Page object
 */

const grid = require('../shared/GridUtils');

const FU = require('../shared/FormUtils');
const GridRow = require('../shared/GridRow');
const components = require('../shared/components');

class PayrollProcessPage {
  constructor() {
    this.gridId = 'multipayroll-grid';
    this.actionLinkColumn = 5;
  }

  /**
   * send back the number of multipayrolls in the grid
   */
  async getEmployeeCount(number, message) {
    await grid.expectRowCount(this.gridId, number, message);
  }

  async editPayrollRubric(reference) {
    const row = new GridRow(reference);
    await row.dropdown().click();
    await row.method('config').click();

    await components.currencyInput.set(120, 'TPR');
    await components.currencyInput.set(150, 'PRI');
    await components.currencyInput.set(100, 'v_cher');
    await components.currencyInput.set(100, 'f_scol');
    await components.currencyInput.set(200, 'allc');
    await components.currencyInput.set(0, 'ac_sal');
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  async errorEditPayrollRubric(reference) {
    const row = new GridRow(reference);
    await row.dropdown().click();
    await row.method('config').click();

    await FU.buttons.submit();
    await components.notification.hasDanger();
  }
}

module.exports = PayrollProcessPage;
