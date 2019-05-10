/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-debtor-group-select]',
  set      : async function set(debtorGroup, uuid) {
    const locator = (uuid) ? by.id(uuid) : by.css(this.selector);
    const target = element(locator);

    // hack to make sure previous 'blur' event fires if we are using
    await target.click();

    return FU.uiSelect('$ctrl.debtorGroupUuid', debtorGroup, target);
  },
};
