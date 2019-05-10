/* global by, element, browser */
const chai = require('chai');

const { expect } = chai;
const helpers = require('../shared/helpers');

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

describe('Login Page', () => {

  // routes used in tests
  const settings = 'settings';
  const login = 'login';

  before(async () => {
    // access the settings page
    await helpers.navigate(settings);

    // click the logout button and close the growl notification
    await element(by.css('[data-logout-button]')).click();
  });

  it('rejects an invalid username/password combo with (only) a growl notification', async () => {
    await FU.input('LoginCtrl.credentials.username', 'undefineds');
    await FU.input('LoginCtrl.credentials.password', 'undefined1');
    await FU.buttons.submit();

    await FU.exists(by.css('.help-block'), false);
    await components.notification.hasDanger();
  });

  it('rejects user missing a username with (only) a help block', async () => {
    await FU.input('LoginCtrl.credentials.username', 'username');
    await element(by.model('LoginCtrl.credentials.password')).clear();
    await FU.buttons.submit();

    await FU.exists(by.css('.help-block'), true);
    await FU.exists(by.css('[data-bh-growl-notification]'), false);
  });


  it('rejects user missing a password with (only) a help block', async () => {
    await FU.input('LoginCtrl.credentials.password', 'password');
    await element(by.model('LoginCtrl.credentials.username')).clear();
    await FU.buttons.submit();

    await FU.exists(by.css('.help-block'), true);
    await FU.exists(by.css('[data-bh-growl-notification]'), false);
  });


  it('rejects a deactivated user to login with a growl notification', async () => {
    await FU.input('LoginCtrl.credentials.username', 'admin');
    await FU.input('LoginCtrl.credentials.password', '1');
    await FU.buttons.submit();

    await FU.exists(by.css('.help-block'), false);
    await components.notification.hasDanger();
  });


  it('has a default project value', async () => {
    const defaultProject = await element(by.model('LoginCtrl.credentials.project'))
      .$('option:checked').getText();

    // eslint-disable-next-line
    expect(defaultProject).to.exist;
    // eslint-disable-next-line
    expect(defaultProject).to.not.be.empty;
  });

  it('allows a valid user to log in to the application', async () => {
    await FU.input('LoginCtrl.credentials.username', 'superuser');
    await FU.input('LoginCtrl.credentials.password', 'superuser');
    await FU.buttons.submit();

    expect(await helpers.getCurrentPath()).to.equal('#!/');
  });

  it('page refresh preserves the use session', async () => {
    await helpers.navigate(settings);
    await browser.refresh();
    expect(await helpers.getCurrentPath()).to.equal(`#!/${settings}`);
  });

  it('prevents access to the login page after login', async () => {
    // go to the setting page (for example)
    await helpers.navigate(settings);

    // assert that we get to the settings page
    expect(await helpers.getCurrentPath()).to.equal(`#!/${settings}`);

    // attempt to access the login page.
    await helpers.navigate(login);

    // assert that a growl notification was shown
    await components.notification.hasWarn();

    // assert that we did not get to the login page
    expect(await helpers.getCurrentPath()).to.equal(`#!/${settings}`);
  });
});
