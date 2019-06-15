/* global element, by */
const FU = require('../FormUtils');

const selector = '[bh-entity-select]';

function set(entity, id) {
  const locator = (id) ? by.id(id) : by.css(selector);
  const target = element(locator);
  return FU.uiSelect('$ctrl.entityUuid', entity, target);
}

module.exports = {
  set,
};
