const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-account-config-select]';

module.exports = {

  set : async function set(account, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = await TU.locator(locator);

    await target.click();

    return TU.uiSelect('$ctrl.configAccountingId', account, target);
  },
};
