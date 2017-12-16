/* global browser, element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-transaction-type-select]',
  set      : function set(transactionTypes, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    target.click();

    transactionTypes.forEach(function (tt){
        FU.uiSelect('$ctrl.selectedTransactionTypes', tt);
    });
  },
};
