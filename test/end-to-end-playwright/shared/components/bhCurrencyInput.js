const TU = require('../TestUtils');
const { by } = require('../TestUtils');

/**
 * hooks for the currency input component described in the component
 * bhCurrencyInput.js.
 *
 */
module.exports = {
  selector : '[data-bh-currency-input]',

  /**
   * sets the value of the currency input
   *
   * @param {string} value - The desired currency name to set
   * @param {string} [id] - id for locator (optional)
   * @returns {Promise} of entering the desired currency
   */
  set : async function set(value, id) {
    const root = await TU.locator(id ? by.id(id) : this.selector);
    const elm = await root.TU.locator(by.model('$ctrl.model'));
    return elm.type(value);
  },

  /**
   * get the value of the currency input
   *
   * @returns {Promise} for the value of the currency field
   */
  get : async function get() {
    const elm = await TU.locator(this.selector);
    return elm.getAttribute('value');
  },
};
