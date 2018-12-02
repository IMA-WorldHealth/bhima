/* global element, by */

/**
 * hooks for the percentage input component described in the component
 * bhPercentageInput.js.
 * @public
 */
module.exports = {
  selector : '[data-bh-percentage-input]',

  /**
   * sets the value of the percentage input.
  */
  set : function set(value, id) {
  // it might be clearer to do this in two steps.
    var root = element(id ? by.id(id) : by.css(this.selector));
    var elm  = root.element(by.model('$ctrl.model'));
    elm.clear().sendKeys(value);
  },

  /**
   * get the value of the percentage input.
   */
  get : function get() {
    var elm = element(by.css(this.selector));
    return elm.getAttribute('value');
  }
};
