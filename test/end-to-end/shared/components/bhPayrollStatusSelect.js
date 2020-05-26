/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-payroll-status-select]',
  set      : async function set(payrollStatus = [], id) {
    const IS_MULTIPLE_SELECTION = true;
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    await target.click();

    await FU.series(payrollStatus,
      state => FU.uiSelect('$ctrl.selectedPayrollStatus', state, null, IS_MULTIPLE_SELECTION));
  },
};
