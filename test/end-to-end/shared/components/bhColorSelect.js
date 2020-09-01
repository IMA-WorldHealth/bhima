/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-color-select]',
  set      : async function set(color, value) {
    const locator = (value) ? by.id(value) : by.css(this.selector);
    const target = element(locator);

    // hack to make sure previous 'blur' event fires if we are using
    // ngModelOptions updateOn 'blur' for every input
    await target.click();

    await FU.uiSelect('$ctrl.value', color, target);
  },
};
