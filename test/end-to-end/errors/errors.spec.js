/* global element, by */

const chai = require('chai');
const helpers = require('../shared/helpers');

const expect = chai.expect;
helpers.configure(chai);

const FU = require('../shared/FormUtils');

describe('Errors', () => {
  describe('404', Test404ErrorHandling);
  describe('403', Test403ErrorHandling);
});

function Test404ErrorHandling() {
  const path = '#!/incorrectPath';

  // navigate to the page
  before(() => helpers.navigate(path));

  it('shows a 404 page when the path doesn\'t exist', function () {
    // make sure 404 exists
    FU.exists(by.css('[data-error="404"]'), true);

    // make sure URL is preserved
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    // make sure we can navigate away
    const settings = '#!/settings';
    helpers.navigate(settings);
    expect(helpers.getCurrentPath()).to.eventually.equal(settings);
  });

}

function Test403ErrorHandling() {
  const path = '#!/settings';
  const pathUnAuthorized = '#!/errors/403';

  // this function is called before all tests are run
  before(() => {
    // go to settings
    helpers.navigate('#!/settings');

    // click logout
    element(by.css('[data-logout-button]')).click();

    // Login for Regular User, the regular User have the right on #!/account and #!/fiscal
    FU.input('LoginCtrl.credentials.username', 'RegularUser');
    FU.input('LoginCtrl.credentials.password', 'RegularUser');

    FU.buttons.submit();
  });

  function navigateToUnauthorizedRoute(route) {
    helpers.navigate(route);
    FU.exists(by.css('[data-error="403"]'), true);
    expect(helpers.getCurrentPath()).to.eventually.equal(route);
    helpers.navigate('#!/settings');
  }

  it('Check Authorized and unauthorized Path of the user RegularUser:', function () {

    navigateToUnauthorizedRoute('#!/employees');

    navigateToUnauthorizedRoute('#!/debtors/groups');

    navigateToUnauthorizedRoute('#!/patients/register');

    navigateToUnauthorizedRoute('#!/cashboxes');
  });

  // this function is called after all tests are run.
  after(() => {
    // go to settings
    helpers.navigate('#!/settings');

    // click logout
    element(by.css('[data-logout-button]')).click();

    // Login for Regular User, the Super User
    FU.input('LoginCtrl.credentials.username', 'superuser');
    FU.input('LoginCtrl.credentials.password', 'superuser');
    FU.buttons.submit();
  });
}
