const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-multiple-cashbox-select]';

module.exports = {

  set : async function set(cashboxes = [], id = null) {
    const IS_MULTIPLE_SELECTION = true;
    const locator = (id) ? by.id(id) : selector;
    const target = await TU.locator(locator);

    await target.click();

    await TU.series(cashboxes, cashbox => TU.uiSelect('$ctrl.cashboxIds', cashbox, null, IS_MULTIPLE_SELECTION));

    // Let the GUI know we are finished selecting cashboxes
    return target.blur();
  },
};
