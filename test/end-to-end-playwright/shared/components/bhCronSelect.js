const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-cron-select]';

module.exports = {
  set : async function set(cron, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = await TU.locator(locator);
    return TU.uiSelect('$ctrl.id', cron, target);
  },
};
