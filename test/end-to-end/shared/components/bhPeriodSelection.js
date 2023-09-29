const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-period-selection]';

module.exports = {
  set : (period, id) => {
    const locator = id ? by.id(id) : selector;
    return TU.select('$ctrl.selectedPeriod', period, TU.locator(locator));
  },
};
