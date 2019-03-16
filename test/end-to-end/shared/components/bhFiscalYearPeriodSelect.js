/* global element, by */
const FU = require('../FormUtils');

const selector = '[bh-fiscal-year-period-select]';

function set(fiscalYearId, periodId, id) {
  const locator = (id) ? by.id(id) : by.css(selector);
  const target = element(locator);
  FU.uiSelect('$ctrl.fiscalId', fiscalYearId, target);
  FU.uiSelect('$ctrl.periodId', periodId, target);
}

module.exports = { set };
