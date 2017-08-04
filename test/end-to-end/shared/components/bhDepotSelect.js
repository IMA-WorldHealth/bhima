/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-depot-select]',
  set      : function set(depot, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    target.click();

    FU.uiSelect('$ctrl.depotId', depot, target);
  },
};
