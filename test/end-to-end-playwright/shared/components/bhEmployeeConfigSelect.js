const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-employee-config-select]';

module.exports = {

  set : async function set(employee, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = TU.locator(locator);

    await target.click();

    return TU.uiSelect('$ctrl.configEmployeeId', employee, target, false, 'exact');
  },
};
