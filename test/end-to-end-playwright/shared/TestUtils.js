/**
 * Utilities for Playwright End-to-End testing
 */

const { expect } = require('@playwright/test');

// Expose function routes
module.exports = {

  registerPage : function registerPage(page) {
    this.page = page;
  },

  /**
   * Fill and <input> element
   *
   * @param {object} page - Playwright browser page
   * @param {string} selector - css/xpath/etc selector for the input field
   * @param {string} value - value to fill into the input field
   * @returns {Promise} for the fill operation
   */
  input : async function input(page, selector, value) {
    return page.fill(selector, value);
  },

  /**
   * Log into the BHIMA server
   *
   * Callers should use 'await' with this function
   *
   * @param {object} page - Playwright browser page
   * @param {string} username - username to log in (optional)
   * @param {string} password - password to log in (optional)
   * @returns {Promise} promise to return the main page after logging in
   */
  login : async function login(page, username, password) {

    // Go to the login page
    await page.goto('http://localhost:8080/#!/login');
    expect(page).toHaveTitle(/BHIMA/);

    // First, switch to English
    expect((await page.innerText('li[role=menuitem]:last-child > a')).trim()).toBe('English');
    // Expose the language drop-down menu
    await page.click('div.panel-heading > div.dropdown > a');
    // Click on the English option
    await page.click('li[role=menuitem]:last-child > a');
    expect(await page.innerText('.panel-heading')).toBe('Login');

    // Log in
    await page.fill('input[name=username]', username || 'superuser');
    await page.fill('input[name=password]', password || 'superuser');
    await page.click('button[type=submit]');

    return page.waitForURL('http://localhost:8080/#!/');
  },

  /**
   * Log out of the BHIMA server
   *
   * Callers should use 'await' with this function
   *
   * @param {object} page - Playwright browser page
   * @returns {Promise} promise to return the login page after logging out
   */
  logout : async function logout(page) {
    // Go to the Settings page to log out
    await page.goto('http://localhost:8080/#!/settings');
    await page.waitForURL('http://localhost:8080/#!/settings');

    // log out
    await page.click('button[ng-click="SettingsCtrl.logout()"]');

    return page.waitForURL('http://localhost:8080/#!/login');
  },

};
