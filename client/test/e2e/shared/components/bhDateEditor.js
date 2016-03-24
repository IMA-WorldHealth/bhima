/* global browser, element, by */

/**
* Date editor component interface for e2e test
* @public
*/
module.exports = {
  selector : '[data-date-editor-input]',

  /**
   * sets the value in date field.
   */
  set : function set(value) {
    var root = element(by.css(this.selector));
    var btn = root.element(by.css('[data-edit-date-btn]'));
    browser.actions().mouseMove(btn).click(); // to fix the no clickable problem

    /**
     * @fixme - this doesn't work.  Prefer using sendKeys() or another method
     * to set the date.
     */
    var input = root.element(by.model('$ctrl.dateValue'));
    input.dateValue = value;
  },

  /**
   * get the value of the date editor input.
   */
  get : function get() {
    var DateInputText = element(by.css(this.selector));
    return DateInputText.getAttribute('date-value');
  }
};
