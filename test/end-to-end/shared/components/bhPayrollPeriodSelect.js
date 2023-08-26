const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-payroll-period-select]';

module.exports = {

  set      : async function set(period, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = await TU.locator(locator);

    await target.click();

    await TU.uiSelect('$ctrl.payrollConfigurationId', period, target);
  },
};
