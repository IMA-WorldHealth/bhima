const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-inventory-group-select]';

module.exports = {

  set : async function set(group, uuid) {
    const locator = (uuid) ? by.id(uuid) : selector;
    const target = TU.locator(locator);

    await target.click();

    await TU.uiSelect('$ctrl.groupUuid', group, target);
  },
};
