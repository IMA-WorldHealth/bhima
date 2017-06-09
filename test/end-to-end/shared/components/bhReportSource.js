/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-report-source]',
  set      : function set(source, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    FU.select('$ctrl.value', source, target);
  },
};
