/* global browser, element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-weekend-config-select]',
  set      : async function set(week, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    // hack to make sure previous 'blur' event fires if we are using
    // ngModelOptions updateOn 'blur' for every input
    await target.click();

    await FU.uiSelect('$ctrl.configWeekId', week, target);
  },
};
