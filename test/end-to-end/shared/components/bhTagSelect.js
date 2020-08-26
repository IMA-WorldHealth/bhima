const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-tag-select]',
  set      : async function set(tags) {
    const root = $(this.selector);
    await FU.typeaheadAppended('$ctrl.$ctrl.tagUuids', tags, root);
  },
};
