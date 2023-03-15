/**
 * Utilities for Playwright End-to-End testing
 */

const { expect } = require('@playwright/test');

// ??? const PATH_REGEXP = /^#!|^#|^!/g;
const PATH_REGEXP = /^[#!/]+/g;

/**
 * Remember the page being used to simplify function calls
 */
let page;

/**
 * These buttons depend on custom data tags to indicate actions.
 * This seems cleaner than using a whole bunch of ids which may
 * potentially collide.
 */
const buttons = {
  // create : () => $('[data-method="create"]').click(),
  // search : () => $('[data-method="search"]').click(),
  submit : () => page.locator('[data-method="submit"]').click(),
  // cancel : () => $('[data-method="cancel"]').click(),
  // edit   : () => $('[data-method="edit"]').click(),
  // clear  : () => $('[data-method="clear"]').click(),
  // print  : () => $('[data-method="print"]').click(),
  // back   : () => $('[data-method="back"]').click(),
  // reset  : () => $('[data-method="reset"]').click(),
  // delete : () => $('[data-method="delete"]').click(),
  // configure : () => $('[data-method="configure"]').click(),
  // add : () => $('[data-method="add"]').click(),
  // save : () => $('[data-method="save"]').click(),
  // grouping : () => $('[data-method="grouping"]').click(),
};

/**
 * Fill an <input> element for a model
 *
 * @param {string} model - name of the ng-model
 * @param {string} value - value to fill into the input field
 * @returns {Promise} for the fill operation
 */
async function input(model, value) {
  if (typeof page === 'undefined') {
    throw new Error('Must call registerPage() first!');
  }

  return page.locator(`[ng-model="${model}"]`).fill(value);

//   const elt = await page.locator(`[ng-model="${model}"]`);
//   return elt.fill(value);
}

/**
 * Selects an option from an <select> html element
 *
 * @param {*} selector - Selector for the select field (must produce unique element)
 * @param {*} value - the option to select (with value="<value>")
 * @returns {Promise} of the result of the selection action
 */
async function selectOption(selector, value) {
  return page.locator(selector).selectOption(value);
}

/**
 * Request navigation to a desired browser page
 *
 * @param {string} browserPath - the path desired (the part after the baseUrl)
 * @returns {Promise} of navigation to the desired path
 */
async function navigate(browserPath) {
  const destination = browserPath.replace(PATH_REGEXP, '');
  return page.goto(`/#!/${destination}`);
}

// Expose function routes
module.exports = {

  /**
   * registerPage - Save the page object for the functions in this module
   *
   * Note: NOT async
   *
   * @param {object} newPage - Playwright test browser test page
   */
  registerPage : function registerPage(newPage) {
    page = newPage;
  },

  /**
   * get the browser path (after the baseUrl)
   *
   * @returns {string} the normalized current path
   */
  getCurrentPath : async function getCurrentPath() {
    const url = page.url();
    const partial = url.split('#!/')[1];
    partial.replace(PATH_REGEXP, '');
    return `/#!/${partial}`;
  },

  /**
   * Log into the BHIMA server
   *
   * Callers should use 'await' with this function
   *
   * @param {string} username - username to log in (optional)
   * @param {string} password - password to log in (optional)
   * @returns {Promise} promise to return the main page after logging in
   */
  login : async function login(username, password) {
    if (typeof page === 'undefined') {
      throw new Error('Must call registerPage() first!');
    }

    // Go to the login page
    await page.goto('/#!/login');
    expect(page).toHaveTitle(/BHIMA/);

    // First, switch to English
    const lang = await page.locator('li[role=menuitem]:last-child > a').innerText();
    expect(lang.trim()).toBe('English');
    // (expose the language drop-down menu)
    await page.locator('div.panel-heading > div.dropdown > a').click();
    // (click on the English option)
    await page.locator('li[role=menuitem]:last-child > a').click();
    await page.waitForURL('**/login');
    // (verify it is now English)
    const loginLabel = await page.locator('.panel-heading').innerText();
    expect(loginLabel).toBe('Login');

    // Log in
    await input('LoginCtrl.credentials.username', username || 'superuser');
    await input('LoginCtrl.credentials.password', password || 'superuser');
    await buttons.submit();

    return page.waitForURL('**/#!/');
  },

  /**
   * Log out of the BHIMA server
   *
   * Callers should use 'await' with this function
   *
   * @returns {Promise} promise to return the login page after logging out
   */
  logout : async function logout() {
    if (typeof page === 'undefined') {
      throw new Error('Must call registerPage() first!');
    }

    // If we are already logged out, don't log out again
    const url = page.url();
    if (url === 'about:blank' || url.endsWith('/login')) {
      return url;
    }

    // Go to the Settings page to log out
    await page.goto('/#!/settings');
    await page.waitForURL('**/settings');

    // log out
    await page.locator('button[data-logout-button]').click();

    return page.waitForURL('**/login');
  },

  buttons,
  input,
  navigate,
  selectOption,
};
