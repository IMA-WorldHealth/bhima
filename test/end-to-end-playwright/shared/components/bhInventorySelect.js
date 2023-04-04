/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-inventory-select]',
  set      : async function set(inventory, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    await target.click();

    await FU.uiSelect('$ctrl.inventoryUuid', inventory, target);
  },
};
