/* global element, by */

/**
 * test harness for the currency select component described in the component
 * bhCurrencySelect.js.
 * @public
 */
module.exports = {
  selector : '[data-bh-currency-select]',

  /**
   * sets the value of the currency select.
   * @todo - make value == ('FC' || 'USD') instead of an id.
  */
  set : function set(value, id) {

    // get the root value of the
    const root = element(id ? by.id(id) : by.css(this.selector));

    // construct a locator for the value
    const locator = `[data-currency-option="${value}"]`;

    // get the approrpriate option by the locator
    const option = root.element(by.css(locator));

    // click it!
    return option.click();
  },
};
