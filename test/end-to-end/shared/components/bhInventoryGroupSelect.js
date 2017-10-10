/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-inventory-group-select]',
  set      : function set(group, uuid) {
    const locator = (uuid) ? by.id(uuid) : by.css(this.selector);
    const target = element(locator);

    // hack to make sure previous 'blur' event fires if we are using
    // ngModelOptions updateOn 'blur' for every input
    target.click();

    FU.uiSelect('$ctrl.groupUuid', group, target);
  },
};
