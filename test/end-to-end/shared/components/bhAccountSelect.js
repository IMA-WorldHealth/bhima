/* global element, by */
const FU = require('../FormUtils');

const selector = '[bh-account-select]';

module.exports = {
  set      : async function set(account, id, optional = null, searchType = null) {
    const locator = (id) ? by.id(id) : by.css(selector);
    const target = optional || element(locator);

    // hack to make sure previous 'blur' event fires if we are using
    // ngModelOptions updateOn 'blur' for every input
    await target.click();

    return FU.uiSelect('$ctrl.accountId', account, target, false, searchType);
  },
};
