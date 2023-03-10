/**
 * Utilities for Playwright End-to-End testing
 */

const { expect } = require('@playwright/test');

// Expose function routes
module.exports = {

  /**
   * registerPage - Save the page object for the functions in this module
   *
   * @param {object} page - Playwright test browser test page
   */
  registerPage : function registerPage(page) {
    this.page = page;
  },

  /**
   * Fill an <input> element
   *
   * @param {string} selector - css/xpath/etc selector for the input field
   * @param {string} value - value to fill into the input field
   * @returns {Promise} for the fill operation
   */
  input : async function input(selector, value) {
    if (typeof this.page === 'undefined') {
      throw new Error('Must call registerPage() first!');
    }
    return this.page.fill(selector, value);
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
    if (typeof this.page === 'undefined') {
      throw new Error('Must call registerPage() first!');
    }

    // Go to the login page
    await this.page.goto('http://localhost:8080/#!/login');
    expect(this.page).toHaveTitle(/BHIMA/);

    // First, switch to English
    expect((await this.page.innerText('li[role=menuitem]:last-child > a')).trim()).toBe('English');
    // Expose the language drop-down menu
    await this.page.click('div.panel-heading > div.dropdown > a');
    // Click on the English option
    await this.page.click('li[role=menuitem]:last-child > a');
    expect(await this.page.innerText('.panel-heading')).toBe('Login');

    // Log in
    await this.page.fill('input[name=username]', username || 'superuser');
    await this.page.fill('input[name=password]', password || 'superuser');
    await this.page.click('button[type=submit]');

    return this.page.waitForURL('http://localhost:8080/#!/');
  },

  /**
   * Log out of the BHIMA server
   *
   * Callers should use 'await' with this function
   *
   * @returns {Promise} promise to return the login page after logging out
   */
  logout : async function logout() {
    if (typeof this.page === 'undefined') {
      throw new Error('Must call registerPage() first!');
    }

    // Go to the Settings page to log out
    await this.page.goto('http://localhost:8080/#!/settings');
    await this.page.waitForURL('http://localhost:8080/#!/settings');

    // log out
    await this.page.click('button[ng-click="SettingsCtrl.logout()"]');

    return this.page.waitForURL('http://localhost:8080/#!/login');
  },

};
