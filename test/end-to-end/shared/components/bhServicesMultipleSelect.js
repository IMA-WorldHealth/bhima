/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-services-multiple-select]',
  set      : async function set(servicesMultipleSelect, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    await target.click();

    await FU.series(servicesMultipleSelect, service => FU.uiSelect('$ctrl.selectedServices', service));
  },
};
