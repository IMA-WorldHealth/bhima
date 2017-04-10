/* global browser, element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-account-select]',
  set      : function set(account, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    // hack to make sure previous 'blur' event fires if we are using
    // ngModelOptions updateOn 'blur' for every input
    target.click();

    FU.uiSelect('$ctrl.accountId', account, target);
  },
};
