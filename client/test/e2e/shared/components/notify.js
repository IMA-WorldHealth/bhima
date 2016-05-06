/* global browser, element, by, protractor */
var chai    = require('chai');
var expect  = chai.expect;

module.exports = {
  verify : function verify() {
    expect(element(by.css('[data-bh-growl-notification]')).isPresent()).to.eventually.equal(true);
  },
  dismiss : function dismiss() {
    return element(by.css('[data-dismiss="notification"]')).click();
  }
};
