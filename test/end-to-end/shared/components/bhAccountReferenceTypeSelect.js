const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-account-reference-type-select]';

module.exports = {

  set : async function set(accountReferenceTypeSelect, id) {
    const locator = (id) ? by.id(id) : by.css(selector);
    const target = await TU.locator(locator);
    await target.click();

    return TU.uiSelect('$ctrl.referenceTypeId', accountReferenceTypeSelect);
  },
};
