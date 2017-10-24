/* global browser, element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-purchase-status-select]',
  set      : function set(purchaseStatus, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    target.click();

    purchaseStatus.forEach(function (ps){
        FU.uiSelect('$ctrl.selectedPurchaseStatus', ps);
    });
  },
};
