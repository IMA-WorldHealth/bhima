const TU = require('../TestUtils');

const selector = '[bh-multiple-depot-search-select]';

// @TODO : Warning!  This has not been tested

module.exports = {

  set : async function set(depot) {
    const root = await TU.locator(selector);
    await TU.typeaheadAppended('$ctrl.depotSelected', depot, root);
  },
};
