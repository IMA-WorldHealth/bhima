const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-requisition-select]';

module.exports = {

  set      : async function set(requisition, uuid) {
    const locator = (uuid) ? by.id(uuid) : selector;
    const target = await TU.locator(locator);

    await target.click();

    await TU.uiSelect('$ctrl.requisitionUuid', requisition, target);
  },
};
