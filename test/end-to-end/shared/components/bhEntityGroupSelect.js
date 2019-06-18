/* global element, by */
const FU = require('../FormUtils');

const selector = '[bh-entity-group-select]';

function set(entityGroup, id) {
  const locator = (id) ? by.id(id) : by.css(selector);
  const target = element(locator);
  return FU.uiSelect('$ctrl.uuid', entityGroup, target);
}

module.exports = {
  set,
};
