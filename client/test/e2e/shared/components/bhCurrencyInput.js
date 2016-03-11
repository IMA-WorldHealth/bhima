/* global element, by */

/**
 * hooks for the currency input component described in the component
 * bhCurrencyInput.js.
 * @public
 */
module.exports = {
  selector : '[data-bh-currency-input]',

  /**
   * sets the value of the currency input.
  */
  set : function set(value, id) {
  // it might be clearer to do this in two steps.
    var root = element(id ? by.id(id) : by.css(this.selector));
    var elm  = root.element(by.model('$ctrl.model'));
    elm.sendKeys(value);
  },

  /**
   * get the value of the currency input.
   */
  get : function get() {
    var elm = element(by.css(this.selector));
    return elm.getAttribute('value');
  }
};


