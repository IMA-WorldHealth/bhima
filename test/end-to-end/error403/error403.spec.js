/* global element, by, inject, browser */
const chai   = require('chai');
const expect = chai.expect;
const helpers = require('../shared/helpers');
helpers.configure(chai);

const FU = require('../shared/FormUtils');

describe('Error 403, Not Authorized', function () {
  const path = '#/settings';
  const pathUnAuthorized = '#/error403';

  // this function is called before all tests are run
  before(() => {
    // go to settings
    helpers.navigate('#/settings');

    // click logout
    element(by.css('[data-logout-button]')).click();

    // Login for Regular User, the regular User have the right on #/account and #/fiscal
    FU.input('LoginCtrl.credentials.username', 'RegularUser');
    FU.input('LoginCtrl.credentials.password', 'RegularUser');

    FU.buttons.submit();
  });

  it('Check Authorized and unauthorized Path of the user RegularUser:', function () {

    helpers.navigate('#/employees');
    expect(helpers.getCurrentPath()).to.eventually.equal(pathUnAuthorized);

    helpers.navigate('#/debtors/groups');
    expect(helpers.getCurrentPath()).to.eventually.equal(pathUnAuthorized);

    helpers.navigate('#/accounts');
    expect(helpers.getCurrentPath()).to.eventually.equal('#/accounts');

    helpers.navigate('#/patients/register');
    expect(helpers.getCurrentPath()).to.eventually.equal(pathUnAuthorized);

    helpers.navigate('#/fiscal');
    expect(helpers.getCurrentPath()).to.eventually.equal('#/fiscal');

    helpers.navigate('#/cashboxes');
    expect(helpers.getCurrentPath()).to.eventually.equal(pathUnAuthorized);

    helpers.navigate('#/fiscal');
    expect(helpers.getCurrentPath()).to.eventually.not.equal(pathUnAuthorized);

  });

  // this function is called after all tests are run.
  after(() => {
    // go to settings
    helpers.navigate('#/settings');

    // click logout
    element(by.css('[data-logout-button]')).click();

    // Login for Regular User, the Super User
    FU.input('LoginCtrl.credentials.username', 'superuser');
    FU.input('LoginCtrl.credentials.password', 'superuser');
    FU.buttons.submit();
  });
});
