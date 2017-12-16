/* global browser, element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-multiple-depot-select]',
  set      : function set(depots, uuid) {
    const locator = (uuid) ? by.id(uuid) : by.css(this.selector);
    const target = element(locator);

    target.click();

    depots.forEach(function (depots){
        FU.uiSelect('$ctrl.depotsUuids', depots);
    });
  },
};
