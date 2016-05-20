/* global browser, element, by, protractor */
var chai    = require('chai');
var expect  = chai.expect;

module.exports = {
  verify : function verify() {
    expect(element(by.css('[data-bh-growl-notification]')).isPresent()).to.eventually.equal(true);
  },

  hasSuccess : function hasSuccess() {
    expect(element(by.css('[data-notification-type="notification-success"]')).isPresent()).to.eventually.equal(true);
  },

  hasWarn : function hasWarn() {
    expect(element(by.css('[data-notification-type="notification-warn"]')).isPresent()).to.eventually.equal(true);
  },

  hasInfo : function hasInfo() {
    expect(element(by.css('[data-notification-type="notification-info"]')).isPresent()).to.eventually.equal(true);
  },

  hasError : function hasError() {
    expect(element(by.css('[data-notification-type="notification-error"]')).isPresent()).to.eventually.equal(true);
  },

  dismiss : function dismiss() {
    return element(by.css('[data-dismiss="notification"]')).click();
  }
};
