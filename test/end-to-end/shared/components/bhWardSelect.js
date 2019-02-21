/* global element, by */
const FU = require('../FormUtils');

const selector = '[bh-ward-select]';

function set(ward, id) {
  const locator = (id) ? by.id(id) : by.css(selector);
  const target = element(locator);
  FU.uiSelect('$ctrl.uuid', ward, target);
}

function validationError() {
  FU.validation.error('$ctrl.uuid');
}

module.exports = {
  set, validationError,
};
