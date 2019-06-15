/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-depot-select]',
  set      : function set(depot, id) {
    const anchor = id ? element(by.id(id)) : $('body');
    return FU.uiSelect('$ctrl.depotUuid', depot, anchor);
  },
};
