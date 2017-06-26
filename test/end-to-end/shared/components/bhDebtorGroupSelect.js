/* global browser, element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-debtor-group-select]',
  set      : function set(debtorGroup, uuid) {
    const locator = (uuid) ? by.id(uuid) : by.css(this.selector);
    const target = element(locator);

    target.click();

    FU.uiSelect('$ctrl.debtorGroupUuid', debtorGroup, target);
  },
};
