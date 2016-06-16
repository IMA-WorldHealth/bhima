/* global element, by, inject, browser */
const chai   = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe('Error 404, Not found', function () {
  const path = '#/settings';  
  const pathUnAuthorized = '#/error403';
  // navigate to the page
  before(() => helpers.navigate(path));

  it('Page 403 is returned when the user uses a path that does not exist', function () {

    // click the logout button and close the Session for SuperUser
    element(by.css('[data-logout-button]')).click();

    // Login for Regular Userm, the regular User have the right on #/account and #/fiscal
    FU.input('LoginCtrl.credentials.username', 'RegularUser');
    FU.input('LoginCtrl.credentials.password', 'RegularUser');

    element(by.id('submit')).click();

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

});
