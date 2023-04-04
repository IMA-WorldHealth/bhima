/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-flux-select]',
  set      : async function set(fluxes, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    await target.click();

    await FU.series(fluxes, flux => FU.uiSelect('$ctrl.selectedFlux', flux));
  },
};
