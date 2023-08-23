const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-fiscal-year-select]';

module.exports = {
  set : async (fiscalYear, id) => {
    const locator = id ? by.id(id) : selector;
    return TU.select('$ctrl.selectedYear', fiscalYear, await TU.locator(locator));
  },
};
