/* global browser, element, by, protractor */
var chai    = require('chai');
var expect  = chai.expect;

module.exports = {
  verify : function verify() {
    expect(element(by.css('[data-bh-growl-notification]')).isPresent()).to.eventually.equal(true);
    dismiss();
  },

  hasSuccess : function hasSuccess() {
    expect(element(by.css('[data-notification-type="notification-success"]')).isPresent()).to.eventually.equal(true);
    dismiss();
  },

  hasWarn : function hasWarn() {
    expect(element(by.css('[data-notification-type="notification-warn"]')).isPresent()).to.eventually.equal(true);
    dismiss();
  },

  hasInfo : function hasInfo() {
    expect(element(by.css('[data-notification-type="notification-info"]')).isPresent()).to.eventually.equal(true);
  },

  hasDanger : function hasDanger() {
    expect(element(by.css('[data-notification-type="notification-danger"]')).isPresent()).to.eventually.equal(true);
    dismiss();
  },

  hasError : function hasError() {
    expect(element(by.css('[data-notification-type="notification-error"]')).isPresent()).to.eventually.equal(true);
    dismiss();
  },

  dismiss
};

function dismiss() {
  return element(by.css('[data-dismiss="notification"]')).click();
}
