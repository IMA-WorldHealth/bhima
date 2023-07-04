const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-inventory-type-select]';

module.exports = {

  set      : async function set(type, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = TU.locator(locator);

    await target.click();

    await TU.uiSelect('$ctrl.typeId', type, target);
  },
};
