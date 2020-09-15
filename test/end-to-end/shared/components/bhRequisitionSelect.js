/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-requisition-select]',
  set      : async function set(requisition, uuid) {
    const locator = (uuid) ? by.id(uuid) : by.css(this.selector);
    const target = element(locator);

    // hack to make sure previous 'blur' event fires if we are using
    // ngModelOptions updateOn 'blur' for every input
    await target.click();

    await FU.uiSelect('$ctrl.requisitionUuid', requisition, target);
  },
};
