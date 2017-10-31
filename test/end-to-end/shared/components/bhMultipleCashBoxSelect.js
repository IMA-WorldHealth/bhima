/* global browser, element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-multiple-cashbox-select]',
  set      : function set(cashboxes, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    target.click();

    cashboxes.forEach(function (cashboxes){
    	FU.uiSelect('$ctrl.cashboxIds', cashboxes);
    });
  },
};
