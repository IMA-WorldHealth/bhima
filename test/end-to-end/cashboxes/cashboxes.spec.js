/* global element, by, browser */

const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

describe('Cashboxes', () => {
  before(() => helpers.navigate('#!/cashboxes'));

  const cashbox = {
    label   : 'Test Principal Cashbox',
    type    : 1,
    project : 'Test Project A',
  };

  // clicks the 'update' button on the cashbox at $index n in the table
  function update(n) {
    return element(by.repeater('box in CashCtrl.cashboxes track by box.id').row(n))
      .$$('a')
      .click();
  }

  it('creates a new cashbox', () => {
    // switch to the create form
    FU.buttons.create();

    FU.input('UpdateCtrl.box.label', cashbox.label);
    FU.radio('UpdateCtrl.box.is_auxiliary', cashbox.type);
    FU.select('UpdateCtrl.box.project_id', 'Test Project A');

    // submit the page to the server
    FU.buttons.submit();

    // make sure the success message shows
    components.notification.hasSuccess();
  });

  it('successfully edits a cashbox', () => {
    // navigate to the update form for the second item
    update(1);

    FU.input('UpdateCtrl.box.label', 'New Cashbox Name');
    FU.radio('UpdateCtrl.box.is_auxiliary', cashbox.type);

    FU.buttons.submit();

    // make sure the success message shows
    components.notification.hasSuccess();
  });

  it('allows the user to change currency accounts', () => {
    // navigate to the update form for the second item
    update(2);

    // get the "FC" (congolese francs) currency
    const FC = element(by.css('[data-currency-id="1"]'));
    FC.click();

    // confirm that the modal appears
    FU.exists(by.css('[uib-modal-window]'), true);
    FU.exists(by.name('CashboxModalForm'), true);

    FU.uiSelect('CashboxModalCtrl.data.account_id', 'Test Gain Account');
    FU.uiSelect('CashboxModalCtrl.data.transfer_account_id', 'Test Loss Account');

    // submit the modal
    FU.modal.submit();

    // confirm that the success feedback message was displaced
    components.notification.hasSuccess();
  });

  // forget to change the gain exchange account id
  it('rejects a missing account on the currency modal', () => {
    helpers.navigate('#!/cashboxes');
    // navigate to the update form for the second item
    update(3);

    // get a locator for the currencies
    const USD = element(by.css('[data-currency-id="2"]'));
    USD.click();

    // confirm that the modal appears
    FU.exists(by.css('[uib-modal-window]'), true);

    FU.uiSelect('CashboxModalCtrl.data.account_id', 'First Test Item Account');

    // submit the modal
    FU.modal.submit();

    // confirm that the modal did not disappear
    FU.exists(by.css('[uib-modal-window]'), true);

    // these inputs should not have error states
    FU.validation.ok('CashboxModalCtrl.data.account_id');
    FU.validation.error('CashboxModalCtrl.data.transfer_account_id');

    FU.uiSelect('CashboxModalCtrl.data.transfer_account_id', 'Test Debtor Group Account');

    // submit the modal
    FU.modal.submit();

    components.notification.hasSuccess();
  });

  it('allows you to delete a cashbox', () => {
    helpers.navigate('#!/cashboxes');
    // navigate to the update form for the second item
    update(0);

    // click the "delete" button
    FU.buttons.delete();

    // confirm the deletion
    components.modalAction.confirm();

    components.notification.hasSuccess();
  });

  it('performs form validation', () => {
    helpers.navigate('#!/cashboxes');
    // switch to the create form
    FU.buttons.create();

    // try to submit to the server.
    FU.buttons.submit();

    // everything should have error highlights
    FU.validation.error('UpdateCtrl.box.project_id');
    FU.validation.error('UpdateCtrl.box.label');

    components.notification.hasDanger();
  });
});
