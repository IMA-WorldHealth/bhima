/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-services-multiple-select]',
  set      : async function set(servicesMultipleSelect, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    await target.click();

    await Promise.all(
      servicesMultipleSelect.map(services => FU.uiSelect('$ctrl.selectedServices', services))
    );
  },
};
