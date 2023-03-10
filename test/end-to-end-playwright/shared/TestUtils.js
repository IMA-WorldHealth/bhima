// Playwright Test Utilities

const { expect } = require('@playwright/test');

// expose routes to the view
module.exports = {

  // Log into the BHIMA server
  // @param {page} Playwright browser page
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

  // Log out of the BHIMA server
  // @param {page} Playwright browser page
  logout : async function logout(page) {
    // Go to the Settings page to log out
    await page.goto('http://localhost:8080/#!/settings');
    await page.waitForURL('http://localhost:8080/#!/settings');

    // log out
    await page.click('button[ng-click="SettingsCtrl.logout()"]');

    return page.waitForURL('http://localhost:8080/#!/login');
  },

};
