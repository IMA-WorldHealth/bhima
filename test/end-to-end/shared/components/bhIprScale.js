/* global browser, element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-ipr-scale]',
  set      : function set(scale) {

    // get the dropdown
    var dropdown = element(by.css('[uib-dropdown-toggle]'));
    dropdown.click();

    // click the correct dropdown item
    var option = element(by.linkText(scale));
    option.click();
  },
};
