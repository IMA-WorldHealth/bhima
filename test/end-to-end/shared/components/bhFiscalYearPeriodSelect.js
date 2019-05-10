/* global element, by */
const FU = require('../FormUtils');

const selector = '[bh-fiscal-year-period-select]';

async function set(fiscalYearId, periodId, id) {
  const locator = (id) ? by.id(id) : by.css(selector);
  const target = element(locator);
  await FU.uiSelect('$ctrl.fiscalId', fiscalYearId, target);
  await FU.uiSelect('$ctrl.periodId', periodId, target);
}

module.exports = { set };
