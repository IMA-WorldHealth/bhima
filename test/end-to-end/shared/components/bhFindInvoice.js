/* global element, by */

const FU = require('../FormUtils');

/**
 * hooks for the find invoice component described in the component
 * bhFindInvoice.js.
 * @public
 */
module.exports = {
  selector : '[data-find-invoice]',

  set : (value) => {
    FU.input('$ctrl.invoiceReference', value);

    element(by.id('search')).click();
  },
};
