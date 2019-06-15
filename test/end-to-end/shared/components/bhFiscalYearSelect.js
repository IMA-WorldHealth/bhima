/* global  element, by */
const FU = require('../FormUtils');

const selector = '[bh-fiscal-year-select]';
module.exports = {
  set : (fiscalYear, id) => {
    const locator = id ? by.id(id) : by.css(selector);
    return FU.select('$ctrl.selectedYear', fiscalYear, element(locator));
  },
};
