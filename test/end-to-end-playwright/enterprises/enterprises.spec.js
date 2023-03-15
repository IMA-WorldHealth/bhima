const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');

// routes used in tests
const location = 'enterprises';

test.beforeEach(async ({ page }) => {
  TU.registerPage(page);
  await TU.login();
  await TU.navigate(location);
});

test.describe('Enterprises', () => {

  // enterprise
  const enterprise = {
    name            : 'Interchurch Medical Assistance',
    abbr            : 'IMA',
    email           : 'ima@imaworldhealth.com',
    po_box          : 'POBOX USA 1',
    phone           : '01500',
    gain_account_id : 'Gain de change',
    loss_account_id : '67611010', // 67611010 - Différences de change
  };

  // default enterprise
  const defaultEnterprise = {
    name            : 'Test Enterprise',
    abbr            : 'TE',
    email           : 'enterprise@test.org',
    po_box          : 'POBOX USA 1',
    phone           : '243 81 504 0540',
    gain_account_id : 'Gain de change',
    loss_account_id : '67611010', // 67611010 - Différences de change
  };

  // project
  const abbr = suffix();
  const project = {
    name : `Test Project ${abbr}`,
    abbr,
  };

  // project update
  const abbrUpdate = suffix();
  const projectUpdate = {
    name : `Test Project Update ${abbrUpdate}`,
    abbr : abbrUpdate,
  };

  test('test', async ({ page }) => {
    // ???
  });

  /**
   * This function returns a random 3 characters string as an abbreviation
   *
   * @function suffix
   * @returns {string} random 3-letter suffix
   */
  function suffix() {
    const a = String.fromCharCode(random(65, 90));
    const b = String.fromCharCode(random(65, 90));
    const c = String.fromCharCode(random(65, 90));
    return `${a}${b}${c}`;
  }

  /**
   * Return a random number from a range
   *
   * @param {number} min - minimum value
   * @param {number} max - maximum value
   * @returns {number} random number between min and max (inclusive)
   */
  function random(min, max) {
    return Math.floor((Math.random() * ((max - min) + 1)) + min);
  }

});
