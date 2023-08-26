const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-account-reference-select]';

module.exports = {
  set      : async function set(accountReference, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = await TU.locator(locator);

    await target.click();

    return TU.uiSelect('$ctrl.accountReferenceId', accountReference, target);
  },
};
