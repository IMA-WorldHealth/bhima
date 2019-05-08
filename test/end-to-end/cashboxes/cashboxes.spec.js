/* global element, by */

const helpers = require('../shared/helpers');
const FU = require('../shared/FormUtils');
const { notification, accountSelect, modalAction } = require('../shared/components');

describe('Cashboxes', () => {
  before(() => helpers.navigate('#!/cashboxes'));

  const cashbox = {
    label   : 'Test Principal Cashbox',
    type    : 1,
    project : 'Test Project A',
  };

  function update(label) {
    return $(`[data-cashbox="${label}"]`).click();
  }

  it('creates a new cashbox', async () => {
    // switch to the create form
    await FU.buttons.create();

    await FU.input('UpdateCtrl.box.label', cashbox.label);
    await FU.radio('UpdateCtrl.box.is_auxiliary', cashbox.type);
    await FU.select('UpdateCtrl.box.project_id', 'Test Project A');

    // submit the page to the server
    await FU.buttons.submit();

    // make sure the success message shows
    await notification.hasSuccess();
  });

  it('successfully edits a cashbox', async () => {
    // navigate to the update form for the second item
    await update('Caisse Principale');

    await FU.input('UpdateCtrl.box.label', 'New Cashbox Name');
    await FU.radio('UpdateCtrl.box.is_auxiliary', cashbox.type);

    await FU.buttons.submit();

    // make sure the success message shows
    await notification.hasSuccess();
  });

  it('allows the user to change currency accounts', async () => {
    // navigate to the update form for the second item
    await update('New Cashbox Name');

    // get the "FC" (congolese francs) currency
    const FC = element(by.css('[data-currency-id="1"]'));
    await FC.click();

    // confirm that the modal appears
    await FU.exists(by.css('[uib-modal-window]'), true);
    await FU.exists(by.name('CashboxModalForm'), true);

    await accountSelect.set('Gain de change', 'account-id');
    await accountSelect.set('Différences de change', 'transfer-account-id');

    // submit the modal
    await FU.modal.submit();

    // confirm that the success feedback message was displaced
    await notification.hasSuccess();
  });

  // forget to change the gain exchange account id
  it.skip('rejects a missing account on the currency modal', async () => {
    await helpers.navigate('#!/cashboxes');
    // navigate to the update form for the second item
    await update('New Cashbox Name');

    // get a locator for the currencies
    const USD = element(by.css('[data-currency-id="2"]'));
    await USD.click();

    // confirm that the modal appears
    await FU.exists(by.css('[uib-modal-window]'), true);

    await accountSelect.set('60511010', 'account-id');
    await accountSelect.set('', 'transfer-account-id');

    // submit the modal
    await FU.modal.submit();

    // confirm that the modal did not disappear
    await FU.exists(by.css('[uib-modal-window]'), true);

    await accountSelect.set('NGO', 'transfer-account-id');

    // submit the modal
    await FU.modal.submit();

    await notification.hasSuccess();
  });

  it('allows you to delete a cashbox', async () => {
    await helpers.navigate('#!/cashboxes');
    // navigate to the update form for the second item
    await update(cashbox.label);

    // click the "delete" button
    await FU.buttons.delete();

    // confirm the deletion
    await modalAction.confirm();

    await notification.hasSuccess();
  });

  it('performs form validation', async () => {
    await helpers.navigate('#!/cashboxes');
    // switch to the create form
    await FU.buttons.create();

    // try to submit to the server.
    await FU.buttons.submit();

    // everything should have error highlights
    // FU.validation.error('UpdateCtrl.box.project_id');
    await FU.validation.error('UpdateCtrl.box.label');

    await notification.hasDanger();
  });
});
