const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-employee-select]';

module.exports = {

  set : async function set(employee, uuid) {
    const locator = (uuid) ? by.id(uuid) : selector;
    const target = await TU.locator(locator);

    await target.click();

    return TU.uiSelect('$ctrl.employeeUuid', employee, target);
  },
};
