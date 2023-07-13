const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-purchase-status-select]';

module.exports = {

  set : async function set(purchaseStatus, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = TU.locator(locator);

    await target.click();

    await TU.series(purchaseStatus, ps => TU.uiSelect('$ctrl.selectedPurchaseStatus', ps));
  },
};
