const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-report-period-select]';

module.exports = {

  set : async function set(period, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = TU.locator(locator);

    await target.click();

    await TU.uiSelect('$ctrl.periodId', period, target);
  },
};
