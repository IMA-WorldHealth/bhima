/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-origin-select]',
  set      : function set(origin, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    target.click();

    FU.uiSelect('$ctrl.originUuid', origin, target);
  },
};
