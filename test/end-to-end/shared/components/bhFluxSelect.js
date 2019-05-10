/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-flux-select]',
  set      : async function set(flux, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    await target.click();

    const promises = flux.map(fl => FU.uiSelect('$ctrl.selectedFlux', fl));
    await Promise.all(promises);
  },
};
