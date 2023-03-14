/**
 * Utilities for Playwright End-to-End testing
 */

const { expect } = require('@playwright/test');

const PATH_REGEXP = /^#!|^#|^!/g;

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
  submit : () => page.click('[data-method="submit"]'),
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

// Expose function routes
module.exports = {

  /**
   * registerPage - Save the page object for the functions in this module
   *
   * @param {object} newPage - Playwright test browser test page
   */
  registerPage : function registerPage(newPage) {
    page = newPage;
  },

  /**
   * Request navigation to a desired browser page
   *
   * @param {string} browserPath - the path desired (the part after the baseUrl)
   * @returns {Promise} of navigation to the desired path
   */
  navigate : async function navigate(browserPath) {
    const destination = browserPath.replace(PATH_REGEXP, '');
    return page.goto(`/#!/${destination}`);
  },

  /**
   * get the browser path (after the baseUrl)
   *
   * @returns {string} the normalized current path
   */
  getCurrentPath : async function getCurrentPath() {
    const url = page.url();
    const partial = url.split('#!')[1];
    partial.replace(PATH_REGEXP, '');
    return `/#!/${partial}`;
  },

  // /**
  //  * Asserts whether an element exists or not
  //  *
  //  * @param {string} locator - locator string
  //  * @param {bool} bool - whether it should exist or not
  //  */
  // exists : async function exists(locator, bool) {
  //   if (typeof page === 'undefined') {
  //     throw new Error('Must call registerPage() first!');
  //   }
  //   expect(
  //     await page(locator).isPresent(),
  //     `Expected locator ${locator.toString()} to ${bool ? '' : 'not'} exist.`,
  //   ).to.equal(bool);
  // },

  /**
   * Fill an <input> element
   *
   * @param {string} model - name of the ng-model
   * @param {string} value - value to fill into the input field
   * @returns {Promise} for the fill operation
   */
  input : async function input(model, value) {
    if (typeof page === 'undefined') {
      throw new Error('Must call registerPage() first!');
    }

    return page.fill(`[ng-model="${model}"]`, value);
  },

  // // get an <input> element by its ng-model
  // input : async function input(model, value, anchor) {

  //   // get the HTML <input> element
  //   const input = anchor
  //     ? anchor.element(by.model(model))
  //     : element(by.model(model));

  //   await input.clear().sendKeys(value);

  //   return input;
  // },

  /**
   * Selects an option from an <select> html element.  Accepts the model
   * selector, the option text, and an optional anchor element to search within.
   * If no anchor is provided, it defaults to the body.
   *
   * @param {string} model - the ng-model target to select
   * @param {string} option - the text of the <option> element to choose
   * @param {string} anchor - tag for the element to search within
   * @returns {Element} - a protractor <option> element
   */
  select : async function select(model, option, anchor = 'body') {
    return page.click(`${anchor} [ng-model="${model}"] > option[label="${option}"]`);
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
    expect((await page.innerText('li[role=menuitem]:last-child > a')).trim()).toBe('English');
    // Expose the language drop-down menu
    await page.click('div.panel-heading > div.dropdown > a');
    // Click on the English option
    await page.click('li[role=menuitem]:last-child > a');
    await page.waitForURL('**/login');

    expect(await page.innerText('.panel-heading')).toBe('Login');

    // Log in
    await page.fill('input[name=username]', username || 'superuser');
    await page.fill('input[name=password]', password || 'superuser');
    await page.click('button[type=submit]');

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
    await page.click('button[data-logout-button]');

    return page.waitForURL('**/login');
  },

  buttons,
};
