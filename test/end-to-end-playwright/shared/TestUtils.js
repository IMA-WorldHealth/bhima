/**
 * Utilities for Playwright End-to-End testing
 */

const { expect } = require('@playwright/test');

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
 * @param {string} model - name/selector of the ng-model for the input field
 * @param {string} value - value to fill into the input field
 * @param {string} [anchor] - optional selector for the parent/anchor for the input field
 * @returns {Promise} for the fill operation
 */
async function input(model, value, anchor) {
  if (typeof page === 'undefined') {
    throw new Error('Must call registerPage() first!');
  }
  const selector = anchor
    ? `${anchor} [ng-model="${model}"]`
    : `[ng-model="${model}"]`;

  return page.locator(selector).fill(value);
}

/**
 * Get the specified model element
 *
 * @param {string} modelName - name/id of the model
 * @param {string} [anchor] - optional selector/locator for the anchor element (defaults to page)
 * @returns {Promise} promise for the desired model element
 */
async function getModel(modelName, anchor) {
  if (typeof page === 'undefined') {
    throw new Error('Must call registerPage() first!');
  }
  if (typeof anchor === 'string') {
    return page.locator(`${anchor} [ng-model="${modelName}"]`);
  }
  if (anchor) {
    return anchor.locator(`[ng-model="${modelName}"]`);
  }
  return page.locator(`[ng-model="${modelName}"]`);
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
   * Note: NOT async
   *
   * @returns {string} the normalized current path
   */
  getCurrentPath : function getCurrentPath() {
    const url = page.url();
    const partial = url.split('#!/')[1];
    partial.replace(PATH_REGEXP, '');
    return `/#!/${partial}`;
  },

  /**
   * Get the desired locator.
   *
   * Convenience function for modules that do not have direct access to the page object.
   *
   * @param {string} selector - selector for the desired element
   * @returns {Promise} for the locator
   */
  locator : async function locator(selector) {
    return page.locator(selector);
  },

  /**
   * Log into the BHIMA server
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

  /**
   * Selects an option from the ui-select dropdown
   *
   * @function uiSelect
   * @param {string} model - the ng-model target to select
   * @param {string} label - the text of the option element to choose
   * @param {Element} anchor - a protractor element to search within
   * @param {boolean} isMultipleSelection
   * @param {string} searchType - contains|exact|fullWord|accountName
   * @returns {Element} - a protractor option element
   */
  uiSelect : async function uiSelect(
    model, label, anchor, isMultipleSelection, searchType = 'contains',
  ) {
    if (typeof page === 'undefined') {
      throw new Error('Must call registerPage() first!');
    }

    // get the HTML <div> element that will trigger the select input
    const select = await getModel(model, anchor);

    // trigger the <input> rendering
    await select.click();

    // type into the <input> element the searchable value
    // only for multiple selection
    if (isMultipleSelection) {
      // WARNING: Not tested yet with Playwright
      await this.input('$select.search', label, select);
    }

    // select the item of the dropdown menu matching the label
    let searchString = label;
    let labelForRegex = label.replace('(', '\\(');
    labelForRegex = labelForRegex.replace(')', '\\)');

    switch (searchType) {
    case 'exact':
      console.debug("WARNING: 'exact' may not work with XPath");
      searchString = new RegExp(`^\\s*${labelForRegex}$`, 'm');
      break;
    case 'fullWord':
      console.debug("WARNING: 'fullWord' may not work with XPath");
      searchString = new RegExp(`\\s+${labelForRegex}(\\s|$)`);
      break;
    case 'accountName':
      console.debug("WARNING: 'accountName' may not work with XPath");
      searchString = new RegExp(`\\d+\\s+${labelForRegex}\\s+`);
      break;
    case 'contains':
    default:
      searchString = label;
      break;
    }

    // To get the regexes working, we may need to get the text of the title and check using the regex
    // If it okay, click; otherwise complain?
    // const selectorText = await select.locator('.dropdown-menu').locator(`//*[contains(text(), '${label}')]`);

    return select.locator('.dropdown-menu').locator(`//*[contains(text(), '${label}')]`).click();
  },

  buttons,
  getModel,
  input,
  navigate,
  selectOption,
};

// console.debug('Page: ', Object.getOwnPropertyNames(page));
// console.table(Object.getOwnPropertyNames(Object.getPrototypeOf(page)).sort());
