/* global element, by */

module.exports = {
  selector : '[data-bh-yes-no-radios]',

  set : function set(value, id) {

    // get the root value of the
    const root = element(id ? by.id(id) : by.css(this.selector));

    // construct a locator for the value
    const locator = `[data-choice="${value}"]`;

    // get the appropriate option by the locator
    const option = root.element(by.css(locator));

    // click it!
    return option.click();
  },
};
