/* global element, by */
const chai = require('chai');
const helpers = require('../shared/helpers');

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

  it(`has an initial list of ${INITIAL_GROUP} creditor groups`, async () => {
    expect(await element.all(by.css('[data-group-entry]')).count()).to.equal(INITIAL_GROUP);
  });

  it('creates a creditor group', async () => {
    await FU.buttons.create();

    await FU.input('CreditorGroupCtrl.bundle.name', group.name);
    await components.accountSelect.set(group.account);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
    expect(await element.all(by.css('[data-group-entry]')).count()).to.equal(INITIAL_GROUP + 1);
  });

  it('updates a creditor group', async () => {
    await element(by.css(`[data-update="${group.name}"]`)).click();

    await FU.input('CreditorGroupCtrl.bundle.name', group.updated_name);
    await element(by.model('CreditorGroupCtrl.bundle.locked')).click();

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('deletes a creditor group', async () => {
    await element(by.css(`[data-update="${group.updated_name}"]`)).click();

    // click the "delete" button
    await FU.buttons.delete();

    await FU.modal.submit();
    await components.notification.hasSuccess();
  });

  it('blocks deletion of a creditor group used in a transaction', async () => {
    await element(by.css(`[data-update="${group.delete_name}"]`)).click();

    // click the "delete" button
    await FU.buttons.delete();

    await FU.modal.submit();
    await components.notification.hasError();
  });
});
