/* global by, element, browser */
const chai = require('chai');
const expect = chai.expect;
const helpers = require('../shared/helpers');
helpers.configure(chai);

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

/**
 * This tests the login page
 */
describe('Login Page', () => {

  // routes used in tests
  const settings = 'settings';
  const login = 'login';

  before(() => {
    // access the settings page
    helpers.navigate(settings);

    // click the logout button and close the growl notification
    element(by.css('[data-logout-button]')).click();
  });

  it('rejects an invalid username/password combo with (only) a growl notification', () => {
    FU.input('LoginCtrl.credentials.username', 'undefineds');
    FU.input('LoginCtrl.credentials.password', 'undefined1');
    FU.buttons.submit();

    FU.exists(by.css('.help-block'), false);
    components.notification.hasDanger();
  });

  it('rejects user missing a username with (only) a help block', () => {
    FU.input('LoginCtrl.credentials.username', 'username');
    element(by.model('LoginCtrl.credentials.password')).clear();
    FU.buttons.submit();

    FU.exists(by.css('.help-block'), true);
    FU.exists(by.css('[data-bh-growl-notification]'), false);
  });


  it('rejects user missing a password with (only) a help block', () => {
    FU.input('LoginCtrl.credentials.password', 'password');
    element(by.model('LoginCtrl.credentials.username')).clear();
    FU.buttons.submit();

    FU.exists(by.css('.help-block'), true);
    FU.exists(by.css('[data-bh-growl-notification]'), false);
  });


  it('has a default project value', () => {
    const defaultProject = element(by.model('LoginCtrl.credentials.project'))
        .$('option:checked').getText();
    expect(defaultProject).to.be.defined;
    expect(defaultProject).to.not.be.empty;
  });

  it('prevents navigation to other pages with a growl notification', () => {
    // assert that we are on the login page with no notifications present on the page
    expect(helpers.getCurrentPath()).to.eventually.equal('#!/login');
    FU.exists(by.css('[data-bh-growl-notification]'), false);

    // attempt to navigate to the settings page
    helpers.navigate(settings);

    // assert that we are still on the login page with a notification
    expect(helpers.getCurrentPath()).to.eventually.equal('#!/login');
    components.notification.hasWarn();
  });

  it('allows a valid user to log in to the application', () => {
    FU.input('LoginCtrl.credentials.username', 'superuser');
    FU.input('LoginCtrl.credentials.password', 'superuser');
    FU.buttons.submit();

    expect(helpers.getCurrentPath()).to.eventually.equal('#!/');
  });

  it('page refresh preserves the use session', () => {
    helpers.navigate(settings);
    browser.refresh();
    expect(helpers.getCurrentPath()).to.eventually.equal(`#!/${settings}`);
  });

  it('prevents access to the login page after login', () => {
    // go to the setting page (for example)
    helpers.navigate(settings);

    // assert that we get to the settings page
    expect(helpers.getCurrentPath()).to.eventually.equal(`#!/${settings}`);

    // attempt to access the login page.
    helpers.navigate(login);

    // assert that a growl notification was shown
    components.notification.hasWarn();

    // assert that we did not get to the login page
    expect(helpers.getCurrentPath()).to.eventually.equal(`#!/${settings}`);
  });
});
