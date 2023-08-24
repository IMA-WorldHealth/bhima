const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-cost-center-select]';

module.exports = {

  set : async function set(costCenter, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = await TU.locator(locator);

    await target.click();

    await TU.uiSelect('$ctrl.costCenterId', costCenter, target);
  },
};
