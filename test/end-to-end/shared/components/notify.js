/* global element, by */


const { expect } = require('chai');

module.exports = {

  hasSuccess : async function hasSuccess() {
    expect(
      await element(by.css('[data-notification-type="notification-success"]')).isPresent(),
      'Expected a success notification, but could not find one.'
    ).to.equal(true);
    await dismiss();
  },

  hasWarn : async function hasWarn() {
    expect(
      await element(by.css('[data-notification-type="notification-warn"]')).isPresent(),
      'Expected a warning notification, but could not find one.'
    ).to.equal(true);
    await dismiss();
  },

  hasInfo : async function hasInfo() {
    expect(
      await element(by.css('[data-notification-type="notification-info"]')).isPresent(),
      'Expected an informational notification, but could not find one.'
    ).to.equal(true);
    await dismiss();
  },

  hasDanger : async function hasDanger() {
    expect(
      await element(by.css('[data-notification-type="notification-danger"]')).isPresent(),
      'Expected a danger notification, but could not find one.'
    ).to.equal(true);
    await dismiss();
  },

  hasError : async function hasError() {
    expect(
      await element(by.css('[data-notification-type="notification-error"]')).isPresent(),
      'Expected a danger notification, but could not find one.'
    ).to.equal(true);
    await dismiss();
  },

  dismiss,
};

function dismiss() {
  return element(by.css('[data-dismiss="notification"]')).click();
}
