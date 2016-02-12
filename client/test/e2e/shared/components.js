/* global inject, browser, element, by, protractor */

/**
 * Hooks for the currency input component described in the component
 * bhCurrencyInput.js.
 * @public
 */
exports.currencyInput = {
  selector : '[data-bh-currency-input]',

  /**
   * Sets the value of the currency input.
   */
  set : function set(value) {
    var elm = element(by.css(this.selector));
    elm.sendKeys(value);
  },

  /**
   * Get the value of the currency input.
   */
  get : function get() {
    var elm = element(by.css(this.selector));
    return elm.getAttribute('value');
  },

  /**
   * returns the presence of the ng-invalid tag
   */
  isInvalid: function () {
    var elm = element(by.css(this.selector));
    return elm.getAttribute('ng-invalid');
  }
};
