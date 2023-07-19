const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-weekend-config-select]';

module.exports = {

  set : async function set(week, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = await TU.locator(locator);

    await target.click();

    await TU.uiSelect('$ctrl.configWeekId', week, target);
  },
};
