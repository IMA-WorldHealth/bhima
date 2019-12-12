/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-user-select]',
  set      : async function set(user, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    // hack to make sure previous 'blur' event fires if we are using
    // ngModelOptions updateOn 'blur' for every input
    await target.click();

    return FU.uiSelect('$ctrl.userId', user, target);
  },
};
