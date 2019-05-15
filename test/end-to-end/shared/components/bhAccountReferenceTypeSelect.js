/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-account-reference-type-select]',
  set      : async function set(accountReferenceTypeSelect, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    // hack to make sure previous 'blur' event fires if we are using
    // ngModelOptions updateOn 'blur' for every input
    await target.click();

    return FU.uiSelect('$ctrl.referenceTypeId', accountReferenceTypeSelect);
  },
};
