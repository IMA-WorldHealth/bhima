/* global browser, element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-services-multiple-select]',
  set      : function set(servicesMultipleSelect, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    target.click();

    servicesMultipleSelect.forEach(function (services){
    	FU.uiSelect('$ctrl.selectedServices', services);
    });
  },
};
