const { expect } = require('@playwright/test');
const TU = require('../TestUtils');

module.exports = {

  hasSuccess : async function hasSuccess() {
    const notification = await TU.waitForSelector('[data-notification-type="notification-success"]');
    const visible = await notification.isVisible();
    expect(visible, 'Expected a success notification, but could not find one.').toBe(true);
    return dismiss();
  },

  hasWarn : async function hasWarn() {
    const notification = await TU.waitForSelector('[data-notification-type="notification-warn"]');
    const visible = await notification.isVisible();
    expect(visible, 'Expected a warning notification, but could not find one.').toBe(true);
    return dismiss();
  },

  hasInfo : async function hasInfo() {
    const notification = await TU.waitForSelector('[data-notification-type="notification-info"]');
    const visible = await notification.isVisible();
    expect(visible, 'Expected an informational notification, but could not find one.').toBe(true);
    return dismiss();
  },

  hasDanger : async function hasDanger() {
    const notification = await TU.waitForSelector('[data-notification-type="notification-danger"]');
    const visible = await notification.isVisible();
    expect(visible, 'Expected a danger notification, but could not find one.').toBe(true);
    return dismiss();
  },

  hasError : async function hasError() {
    const notification = await TU.waitForSelector('[data-notification-type="notification-error"]');
    const visible = await notification.isVisible();
    expect(visible, 'Expected an error notification, but could not find one.').toBe(true);
    return dismiss();
  },

  dismiss,
};

async function dismiss() {
  return (await TU.locator('[data-dismiss="notification"]')).click();
}
