const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-payroll-status-select]';

module.exports = {

  set : async function set(payrollStatus = [], id = null) {
    const IS_MULTIPLE_SELECTION = true;
    const locator = (id) ? by.id(id) : selector;
    const target = await TU.locator(locator);

    await target.click();

    await TU.series(payrollStatus,
      state => TU.uiSelect('$ctrl.selectedPayrollStatus', state, null, IS_MULTIPLE_SELECTION));
  },
};
