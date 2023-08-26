const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-choice-list-select]';

module.exports = {
  set      : async function set(list, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = await TU.locator(locator);

    await target.click();

    return TU.uiSelect('$ctrl.list', list, target);
  },
};
