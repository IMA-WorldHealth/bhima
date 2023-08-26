const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-account-select]';

module.exports = {
  set      : async function set(account, id, anchor = null, searchType = null) {
    const locator = id ? by.id(id) : selector;
    const target = anchor || await TU.locator(locator);

    await target.click();

    return TU.uiSelect('$ctrl.accountId', account, target, false, searchType);
  },
};
