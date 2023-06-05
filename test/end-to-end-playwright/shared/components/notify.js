const { expect } = require('@playwright/test');
const playwright = require('@playwright/test');
const TU = require('../TestUtils');

module.exports = {

  hasSuccess : async function hasSuccess() {
    let success = false;
    try {
      await TU.waitForSelector('[data-notification-type="notification-success"]', { timeout : 5000 });
      success = true;
    } catch (error) {
      if (error instanceof playwright.errors.TimeoutError) {
        // pass
      } else {
        throw error;
      }
    }
    expect(success, 'Expected a success notification, but could not find one.').toBe(true);
    return dismiss();
  },

  hasWarn : async function hasWarn() {
    let success = false;
    try {
      await TU.waitForSelector('[data-notification-type="notification-warn"]', { timeout : 5000 });
      success = true;
    } catch (error) {
      if (error instanceof playwright.errors.TimeoutError) {
        // pass
      } else {
        throw error;
      }
    }
    expect(success, 'Expected a warning notification, but could not find one.').toBe(true);
    return dismiss();
  },

  hasInfo : async function hasInfo() {
    let success = false;
    try {
      await TU.waitForSelector('[data-notification-type="notification-info"]', { timeout : 5000 });
      success = true;
    } catch (error) {
      if (error instanceof playwright.errors.TimeoutError) {
        // pass
      } else {
        throw error;
      }
    }
    expect(success, 'Expected an informational notification, but could not find one.').toBe(true);
    return dismiss();
  },

  hasDanger : async function hasDanger() {
    let success = false;
    try {
      await TU.waitForSelector('[data-notification-type="notification-danger"]', { timeout : 5000 });
      success = true;
    } catch (error) {
      if (error instanceof playwright.errors.TimeoutError) {
        // pass
      } else {
        throw error;
      }
    }
    expect(success, 'Expected a danger notification, but could not find one.').toBe(true);
    return dismiss();
  },

  hasError : async function hasError() {
    let success = false;
    try {
      await TU.waitForSelector('[data-notification-type="notification-error"]', { timeout : 5000 });
      success = true;
    } catch (error) {
      if (error instanceof playwright.errors.TimeoutError) {
        // pass
      } else {
        throw error;
      }
    }
    expect(success, 'Expected an error notification, but could not find one.').toBe(true);
    return dismiss();
  },

  dismiss,
};

async function dismiss() {
  return (await TU.locator('[data-dismiss="notification"]')).click();
}
