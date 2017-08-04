/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-inventory-select]',
  set      : function set(inventory, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    target.click();

    FU.uiSelect('$ctrl.inventoryId', inventory, target);
  },
};
