/* global element, by */
const FU = require('../FormUtils');

const selector = '[bh-cron-select]';

function set(cron, id) {
  const locator = (id) ? by.id(id) : by.css(selector);
  const target = element(locator);
  return FU.uiSelect('$ctrl.id', cron, target);
}

module.exports = {
  set,
};
