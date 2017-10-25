/* global browser, element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-flux-select]',
  set      : function set(flux, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    target.click();

    flux.forEach(function (fl){
        FU.uiSelect('$ctrl.selectedFlux', fl);
    });
  },
};
