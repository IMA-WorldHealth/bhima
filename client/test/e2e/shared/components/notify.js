/* global element, by */
'use strict';
var chai    = require('chai');
var expect  = chai.expect;

module.exports = {

  hasSuccess : function hasSuccess() {
    expect(
      element(by.css('[data-notification-type="notification-success"]')).isPresent(),
      'Expected a success notification, but could not find one.'
    ).to.eventually.equal(true);
    dismiss();
  },

  hasWarn : function hasWarn() {
    expect(
      element(by.css('[data-notification-type="notification-warn"]')).isPresent(),
      'Expected a warning notification, but could not find one.'
    ).to.eventually.equal(true);
    dismiss();
  },

  hasInfo : function hasInfo() {
    expect(
      element(by.css('[data-notification-type="notification-info"]')).isPresent(),
      'Expected an informational notification, but could not find one.'
    ).to.eventually.equal(true);
    dismiss();
  },

  hasDanger : function hasDanger() {
    expect(
      element(by.css('[data-notification-type="notification-danger"]')).isPresent(),
      'Expected a danger notification, but could not find one.'
    ).to.eventually.equal(true);
    dismiss();
  },

  hasError : function hasError() {
    expect(
      element(by.css('[data-notification-type="notification-error"]')).isPresent(),
      'Expected a danger notification, but could not find one.'
    ).to.eventually.equal(true);
    dismiss();
  },

  dismiss
};

function dismiss() {
  return element(by.css('[data-dismiss="notification"]')).click();
}
