/* global element, by */

const { expect } = require('chai');
const helpers = require('../shared/helpers');
const FU = require('../shared/FormUtils');

describe('Errors', () => {
  describe('404', Test404ErrorHandling);
  describe('403', Test403ErrorHandling);
});

function Test404ErrorHandling() {
  const path = '#!/incorrectPath';

  // navigate to the page
  before(() => helpers.navigate(path));

  it('shows a 404 page when the path doesn\'t exist', async () => {
    // make sure 404 exists
    await FU.exists(by.css('[data-error="404"]'), true);

    // make sure URL is preserved
    expect(await helpers.getCurrentPath()).to.equal(path);

    // make sure we can navigate away
    const settings = '#!/settings';
    await helpers.navigate(settings);
    expect(await helpers.getCurrentPath()).to.equal(settings);
  });

}

function Test403ErrorHandling() {
  before(async () => {
    await helpers.navigate('#!/settings');

    // click logout
    await element(by.css('[data-logout-button]')).click();

    // Login for Regular User, the regular User have the right on #!/account and #!/fiscal
    await FU.input('LoginCtrl.credentials.username', 'RegularUser');
    await FU.input('LoginCtrl.credentials.password', 'RegularUser');

    await FU.buttons.submit();
  });

  async function navigateToUnauthorizedRoute(route) {
    await helpers.navigate(route);
    await FU.exists(by.css('[data-error="403"]'), true);
    expect(await helpers.getCurrentPath()).to.equal(route);
    await helpers.navigate('#!/settings');
  }

  it('check Authorized and unauthorized Path of the user RegularUser:', async () => {
    await navigateToUnauthorizedRoute('#!/employees');

    await navigateToUnauthorizedRoute('#!/debtors/groups');

    await navigateToUnauthorizedRoute('#!/patients/register');

    await navigateToUnauthorizedRoute('#!/cashboxes');
  });

  // this function is called after all tests are run.
  after(async () => {
    // go to settings
    await helpers.navigate('#!/settings');

    // click logout
    await element(by.css('[data-logout-button]')).click();

    // Login for Regular User, the Super User
    await FU.input('LoginCtrl.credentials.username', 'superuser');
    await FU.input('LoginCtrl.credentials.password', 'superuser');
    await FU.buttons.submit();
  });
}
