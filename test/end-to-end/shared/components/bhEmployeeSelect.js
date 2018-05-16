/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-employee-select]',
  set      : function set(employee, uuid) {
    const locator = (uuid) ? by.id(uuid) : by.css(this.selector);
    const target = element(locator);

    // hack to make sure previous 'blur' event fires if we are using
    // ngModelOptions updateOn 'blur' for every input
    target.click();

    FU.uiSelect('$ctrl.employeeUuid', employee, target);
  },
};
