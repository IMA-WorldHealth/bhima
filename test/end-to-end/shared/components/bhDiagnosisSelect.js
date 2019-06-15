/* global element, by */
const FU = require('../FormUtils');

const selector = '[bh-diagnosis-select]';

async function set(diagnosis, id) {
  const locator = (id) ? by.id(id) : by.css(selector);
  const target = element(locator);
  await FU.typeahead('$ctrl.diagnosis', diagnosis, target);
}

function validationError() {
  return FU.validation.error('$ctrl.diagnosis');
}

module.exports = {
  set, validationError,
};
