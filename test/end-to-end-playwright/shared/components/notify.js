const { expect } = require('@playwright/test');
const TU = require('../TestUtils');

module.exports = {

  hasSuccess : async function hasSuccess() {
    const notification = await TU.waitForSelector('[data-notification-type="notification-success"]');
    const visible = await notification.isVisible();
    expect(visible, 'Expected a success notification, but could not find one.').toBe(true);
    return dismiss();
  },

  // hasWarn : async function hasWarn() {
  //   expect(
  //     await element(by.css('[data-notification-type="notification-warn"]')).isPresent(),
  //     'Expected a warning notification, but could not find one.'
  //   ).to.equal(true);
  //   await dismiss();
  // },

  // hasInfo : async function hasInfo() {
  //   expect(
  //     await element(by.css('[data-notification-type="notification-info"]')).isPresent(),
  //     'Expected an informational notification, but could not find one.'
  //   ).to.equal(true);
  //   await dismiss();
  // },

  // hasDanger : async function hasDanger() {
  //   expect(
  //     await element(by.css('[data-notification-type="notification-danger"]')).isPresent(),
  //     'Expected a danger notification, but could not find one.'
  //   ).to.equal(true);
  //   await dismiss();
  // },

  // hasError : async function hasError() {
  //   expect(
  //     await element(by.css('[data-notification-type="notification-error"]')).isPresent(),
  //     'Expected a danger notification, but could not find one.'
  //   ).to.equal(true);
  //   await dismiss();
  // },

  dismiss,
};

async function dismiss() {
  return (await TU.locator('[data-dismiss="notification"]')).click();
}
