/* global browser, element, by */
const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);
const expect = chai.expect;

const components = require('../shared/components');
const FU = require('../shared/FormUtils');

describe('Creditor Groups Management', () => {
  const path = '#!/creditors/groups';
  before(() => helpers.navigate(path));

  const INITIAL_GROUP = 2;
  const USED_CREDITOR_GROUP = 'Personnel [Creditor Group Test]';

  const currentDate = new Date();
  const uniqueIdentifier = currentDate.getTime().toString();

  const group = {
    name         : `E2E Creditor Group ${uniqueIdentifier}`,
    updated_name : `E2E Creditor Group Updated ${uniqueIdentifier}`,
    account      : '41001',
  };

  it('Get initial list of creditor groups', () => {
    expect(element.all(by.css('[data-group-entry]')).count()).to.eventually.equal(INITIAL_GROUP);
  });

  it('creates a creditor group', () => {
    FU.buttons.create();

    FU.input('CreditorGroupCtrl.bundle.name', group.name);
    components.accountSelect.set(group.account);

    FU.buttons.submit();
    components.notification.hasSuccess();
    expect(element.all(by.css('[data-group-entry]')).count()).to.eventually.equal(INITIAL_GROUP + 1);
  });

  it('updates a creditor group', () => {
    element(by.css(`[data-update="${group.name}"]`)).click();

    FU.input('CreditorGroupCtrl.bundle.name', group.updated_name);
    element(by.model('CreditorGroupCtrl.bundle.locked')).click();

    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('Cannot delete a used creditor group', () => {
    element(by.css(`[data-delete="${USED_CREDITOR_GROUP}"]`)).click();

    FU.buttons.submit();
    components.notification.hasError();
  });

  it('Delete a creditor group', () => {
    element(by.css(`[data-delete="${group.updated_name}"]`)).click();

    FU.buttons.submit();
    components.notification.hasSuccess();
  });
});
