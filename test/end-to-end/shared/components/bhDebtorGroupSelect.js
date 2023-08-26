const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-debtor-group-select]';

module.exports = {

  set : async function set(debtorGroup, uuid) {
    const locator = (uuid) ? by.id(uuid) : by.css(selector);
    const target = await TU.locator(locator);

    await target.click();

    return TU.uiSelect('$ctrl.debtorGroupUuid', debtorGroup, target);
  },

};
