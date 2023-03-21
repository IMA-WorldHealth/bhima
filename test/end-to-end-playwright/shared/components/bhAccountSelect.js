const TU = require('../TestUtils');

const selector = '[bh-account-select]';

module.exports = {
  set      : async function set(account, id, optional = null, searchType = null) {
    const locator = id ? `#${id}` : selector;
    const target = optional || await TU.locator(locator);

    // Hack to make sure previous 'blur' event fires if we are using
    // ngModelOptions updateOn 'blur' for every input
    await target.click();

    return TU.uiSelect('$ctrl.accountId', account, target, false, searchType);
  },
};
