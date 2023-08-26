const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-report-source]';

// @TODO : Warning!  This has not been tested

module.exports = {

  set : function set(source, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = TU.locator(locator);

    return TU.select('$ctrl.value', source, target);
  },
};
