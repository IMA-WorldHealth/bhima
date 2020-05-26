/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-purchase-status-select]',
  set      : async function set(purchaseStatus, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    await target.click();

    await FU.series(purchaseStatus, ps => FU.uiSelect('$ctrl.selectedPurchaseStatus', ps));
  },
};
