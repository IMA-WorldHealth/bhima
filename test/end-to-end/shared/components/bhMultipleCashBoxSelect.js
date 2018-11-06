/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-multiple-cashbox-select]',
  set      : function set(cashboxes = [], id) {
    const IS_MULTIPLE_SELECTION = true;
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    target.click();

    cashboxes.forEach(cashbox => {
      FU.uiSelect('$ctrl.cashboxIds', cashbox, null, IS_MULTIPLE_SELECTION);
    });
  },
};
