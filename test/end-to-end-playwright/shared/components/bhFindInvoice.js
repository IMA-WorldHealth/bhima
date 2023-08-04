const TU = require('../TestUtils');
const { by } = require('../TestUtils');

// const selector = '[data-find-invoice]';

/**
 * hooks for the find invoice component described in the component
 * bhFindInvoice.js.
 */
module.exports = {

  set : async (value) => {
    await TU.input('$ctrl.invoiceReference', value);
    await TU.locator(by.id('search-button')).click();
  },
};
