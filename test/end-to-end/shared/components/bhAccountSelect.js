/* global browser, element, by */

const FU = require('../FormUtils');

module.exports = {

  // root level css selector for this component
  selector : '[data-bh-account-select]',

  set: function set(bhAccountSelectName, label) {
    FU.uiSelect('$ctrl.initialValue', label, $(`[name="${bhAccountSelectName}"] ${this.selector}`));
  }
};
