/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-transaction-type-select]',
  set      : function set(transactionTypes, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    element(locator).click();

    transactionTypes.forEach(type => {
      FU.uiSelect('$ctrl.selectedTransactionTypes', type);
    });
  },
};
