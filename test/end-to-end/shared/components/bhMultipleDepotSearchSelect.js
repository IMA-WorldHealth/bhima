const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-multiple-depot-search-select]',
  set      : async function set(depot) {
    const root = $(this.selector);
    await FU.typeaheadAppended('$ctrl.depotSelected', depot, root);
  },
};
