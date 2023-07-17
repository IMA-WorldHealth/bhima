const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-ward-select]';

async function set(ward, id) {
  const locator = (id) ? by.id(id) : selector;
  const target = await TU.locator(locator);
  return TU.uiSelect('$ctrl.uuid', ward, target);
}

function validationError() {
  return TU.validation.error('$ctrl.uuid');
}

module.exports = {
  set, validationError,
};
