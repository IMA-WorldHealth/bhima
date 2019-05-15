/* global element, by */

const FU = require('../FormUtils');

/**
 * hooks for the find invoice component described in the component
 * bhFindInvoice.js.
 * @public
 */
module.exports = {
  selector : '[data-find-invoice]',

  set : async (value) => {
    await FU.input('$ctrl.invoiceReference', value);
    await element(by.id('search-button')).click();
  },
};
