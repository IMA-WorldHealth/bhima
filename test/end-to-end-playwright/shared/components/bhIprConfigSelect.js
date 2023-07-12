const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-ipr-config-select]';

module.exports = {

  set : async function set(ipr, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = TU.locator(locator);

    await target.click();

    await TU.uiSelect('$ctrl.configIprId', ipr, target);
  },
};
