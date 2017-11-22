/* global element, by */
const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);
const { expect } = chai;

const components = require('../shared/components');
const FU = require('../shared/FormUtils');

describe('Creditor Groups Management', () => {
  const path = '#!/creditors/groups';
  before(() => helpers.navigate(path));

  const INITIAL_GROUP = 3;

  const currentDate = new Date();
  const uniqueIdentifier = currentDate.getTime().toString();

  const group = {
    name         : `E2E Creditor Group ${uniqueIdentifier}`,
    delete_name  : 'SNEL',
    updated_name : `E2E Creditor Group Updated ${uniqueIdentifier}`,
    account      : '40111000', // 40111000 - SNEL SUPPLIER
  };

  it(`has an initial list of ${INITIAL_GROUP} creditor groups`, () => {
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

  it('deletes a creditor group', () => {
    element(by.css(`[data-update="${group.updated_name}"]`)).click();

    // click the "delete" button
    FU.buttons.delete();

    FU.modal.submit();
    components.notification.hasSuccess();
  });

  it('blocks deletion of a creditor group used in a transaction', () => {
    element(by.css(`[data-update="${group.delete_name}"]`)).click();

    // click the "delete" button
    FU.buttons.delete();

    FU.modal.submit();
    components.notification.hasError();
  });
});
