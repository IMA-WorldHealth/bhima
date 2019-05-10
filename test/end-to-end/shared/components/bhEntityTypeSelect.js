/* global element, by */
const FU = require('../FormUtils');

const selector = '[bh-entity-type-select]';

function set(type, id) {
  const locator = (id) ? by.id(id) : by.css(selector);
  const target = element(locator);
  return FU.uiSelect('$ctrl.id', type, target);
}

module.exports = {
  set,
};
