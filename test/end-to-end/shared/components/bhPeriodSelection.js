/* global  element, by */
const FU = require('../FormUtils');

const selector = '[bh-period-selection]';

module.exports = {
  set : (period, id) => {
    const locator = id ? by.id(id) : by.css(selector);
    FU.select('$ctrl.selectedPeriod', period, element(locator));
  },
};
