/**
 * This class is represents a payroll configuration page in term of structure and
 * behaviour so it is a payroll configuration page object
 */

/* loading grid actions */
const GA = require('../shared/GridAction');
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class PayrollConfigPage {
  constructor() {
    this.gridId = 'payroll-configuration-grid';
    this.actionLinkColumn = 3;
  }

  /**
   * simulate the create PayrollConfig button click to show the dialog of creation
   */
  async createPayrollConfig(payrollConfig) {
    await FU.buttons.create();
    await FU.input('PayrollConfigModalCtrl.payroll.label', payrollConfig.label);

    if (payrollConfig.period) {
      await $(`[data-date-range="${payrollConfig.period}"]`).click();
    }

    await components.rubricConfigSelect.set(payrollConfig.config_rubric_id, 'config_rubric_id');
    await components.accountConfigSelect.set(payrollConfig.config_accounting_id, 'config_accounting_id');
    await components.weekConfigSelect.set(payrollConfig.config_weekend_id, 'config_weekend_id');
    await components.iprConfigSelect.set(payrollConfig.config_ipr_id, 'config_ipr_id');
    await components.employeeConfigSelect.set(payrollConfig.config_employee_id, 'config_employee_id');
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  async errorOnCreatePayrollConfig() {
    await FU.buttons.create();
    await FU.buttons.submit();
    await FU.validation.error('PayrollConfigModalCtrl.payroll.label');
    await FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  async editPayrollConfig(label, updatePayrollConfig) {
    const { rowIndex } = await GU.getGridIndexesMatchingText(this.gridId, label);
    await GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
    await FU.input('PayrollConfigModalCtrl.payroll.label', updatePayrollConfig.label);

    if (updatePayrollConfig.period) {
      await $(`[data-date-range="${updatePayrollConfig.period}"]`).click();
    }

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * simulate a click on the delete link of a function
   */
  async deletePayrollConfig(label) {
    const { rowIndex } = await GU.getGridIndexesMatchingText(this.gridId, label);
    await GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'delete', this.gridId);
    await components.modalAction.confirm();
    await components.notification.hasSuccess();
  }
}

module.exports = PayrollConfigPage;
