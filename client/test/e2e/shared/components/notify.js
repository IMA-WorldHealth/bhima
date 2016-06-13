/* global browser, element, by, protractor */
const chai    = require('chai');
const expect  = chai.expect;

module.exports = {
  verify : function verify() {
    expect(
      $('[data-bh-growl-notification]').isPresent(),
      'Expected a growl notification to be present, but could not find one.'
    ).to.eventually.equal(true);
    dismiss();
  },

  hasSuccess : function hasSuccess() {
    expect(
      $('[data-notification-type="notification-success"]').isPresent(),
      'Expected a growl success notification to be present, but could not find one.'
    ).to.eventually.equal(true);
    dismiss();
  },

  hasWarn : function hasWarn() {
    expect(
      $('[data-notification-type="notification-warn"]').isPresent(),
      'Expected a growl warning notification to be present, but could not find one.'
    ).to.eventually.equal(true);
    dismiss();
  },

  hasInfo : function hasInfo() {
    expect(
      $('[data-notification-type="notification-info"]').isPresent(),
      'Expected a growl information notification to be present, but could not find one.'
    ).to.eventually.equal(true);
  },

  hasDanger : function hasDanger() {
    expect(
      $('[data-notification-type="notification-danger"]').isPresent(),
      'Expected a growl danger notification to be present, but could not find one.'
    ).to.eventually.equal(true);
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
