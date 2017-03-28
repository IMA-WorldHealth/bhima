/* global element, by */

const FU = require('../FormUtils');

/**
 * utilities functions for bhDepotDropdown component
 * bhDepotDropdown.js.
 * @public
 */
module.exports = {
  selector : '[data-bh-depot-select]',

  /**
   * sets the value of the depot selected
  */
  set : function set(label) {
    FU.dropdown(this.selector, label);
  },

};
