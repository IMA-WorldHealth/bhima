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
    const root = element(id ? by.id(id) : by.css(this.selector));
    const elm = root.element(by.model('$ctrl.model'));
    return elm.clear().sendKeys(value);
  },

  /**
   * get the value of the currency input.
   */
  get : function get() {
    const elm = element(by.css(this.selector));
    return elm.getAttribute('value');
  },
};
