/* global element, by */
const FU = require('../FormUtils');

const selector = '[bh-gender-select]';

function set(gender, id) {
  const locator = (id) ? by.id(id) : by.css(selector);
  const target = element(locator);
  return FU.select('$ctrl.value', gender, target);
}

module.exports = {
  set,
};
