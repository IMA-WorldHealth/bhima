const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-cashbox-select]';

module.exports = {

  set : async function set(cashbox, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = TU.locator(locator);

    await target.click();

    return TU.uiSelect('$ctrl.cashboxId', cashbox, target);
  },
};
