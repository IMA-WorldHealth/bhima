/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-service-select]',
  set      : async function set(service, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    // hack to make sure previous 'blur' event fires if we are using
    // ngModelOptions updateOn 'blur' for every input
    await target.click();

    await FU.uiSelect('$ctrl.serviceId', service, target);
  },
};
