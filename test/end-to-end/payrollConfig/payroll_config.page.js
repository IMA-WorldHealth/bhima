/* global element, by */

/**
 * This class is represents a payroll configuration page in term of structure and
 * behaviour so it is a payroll configuration page object
 */

const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

/* loading grid actions */
const GA = require('../shared/GridAction');
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class PayrollConfigPage {
  constructor() {
    this.gridId = 'payroll-configuration-grid';
    this.rubricGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 3;
  }

  /**
   * simulate the create PayrollConfig button click to show the dialog of creation
   */
  createPayrollConfig(payrollConfig) {
    FU.buttons.create();
    FU.input('PayrollConfigModalCtrl.payroll.label', payrollConfig.label);

    if (payrollConfig.period) {
      $(`[data-date-range="${payrollConfig.period}"]`).click();
    }

    components.rubricConfigSelect.set(payrollConfig.config_rubric_id, 'config_rubric_id');
    components.accountConfigSelect.set(payrollConfig.config_accounting_id, 'config_accounting_id');
    components.weekConfigSelect.set(payrollConfig.config_weekend_id, 'config_weekend_id');
    components.iprConfigSelect.set(payrollConfig.config_ipr_id, 'config_ipr_id');
    components.employeeConfigSelect.set(payrollConfig.config_employee_id, 'config_employee_id');
    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  errorOnCreatePayrollConfig() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('PayrollConfigModalCtrl.payroll.label');
    FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  editPayrollConfig(label, updatePayrollConfig) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
        FU.input('PayrollConfigModalCtrl.payroll.label', updatePayrollConfig.label);

        if (updatePayrollConfig.period) {
          $(`[data-date-range="${updatePayrollConfig.period}"]`).click();
        }

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the delete link of a function
   */
  deletePayrollConfig(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'delete', this.gridId);
        components.modalAction.confirm();
        components.notification.hasSuccess();
      });
  }
}

module.exports = PayrollConfigPage;
