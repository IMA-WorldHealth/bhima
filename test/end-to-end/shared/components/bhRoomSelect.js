/* global element, by */
const FU = require('../FormUtils');

const selector = '[bh-room-select]';

function set(room, id) {
  const locator = (id) ? by.id(id) : by.css(selector);
  const target = element(locator);
  return FU.uiSelect('$ctrl.uuid', room, target);
}

function validationError() {
  return FU.validation.error('$ctrl.uuid');
}

module.exports = {
  set, validationError,
};
