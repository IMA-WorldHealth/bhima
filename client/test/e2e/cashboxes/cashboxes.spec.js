/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const helpers = require('../shared/helpers');
helpers.configure(chai);

const FU = require('../shared/FormUtils');

describe('Cashbox Module', function () {

  const path = '#/cashboxes';

  const cashbox = {
    label:    'Test Principal Cashbox',
    type:    1,
    project: 1
  };

  function update(n) {
    return element(by.repeater('box in CashCtrl.cashboxes track by box.id').row(n))
      .$$('a')
      .click();
  }

  // navigate to the cashbox module before each test
  beforeEach(function () {
    browser.get(path);
  });

  it('successfully creates a new cashbox', function () {

    // switch to the create form
    FU.buttons.create();

    FU.input('CashCtrl.box.label', cashbox.label);
    FU.radio('CashCtrl.box.type', cashbox.type);

    // select the first non-disabled option
    FU.select('CashCtrl.box.project_id')
      .enabled()
      .first()
      .click();

    // submit the page to the server
    FU.buttons.submit();

    // make sure the success message shows
    FU.exists(FU.feedback.success(), true);

    // click the cancel button
    FU.buttons.cancel();

    // make sure the message is cleared
    FU.exists(FU.feedback.success(), false);
  });

  it('successfully edits a cashbox', function () {

    // navigate to the update form for the second item
    update(1);

    FU.input('CashCtrl.box.label', 'New Cashbox Name');
    FU.radio('CashCtrl.box.type', cashbox.type);

    // make sure no messages are displayed
    FU.exists(FU.feedback.success(), false);

    FU.buttons.submit();

    // success message!
    FU.exists(FU.feedback.success(), true);
  });

  it('allows the user to change currency accounts', function () {

    // navigate to the update form for the second item
    update(2);

    // get the "FC" (congolese francs) currency
    var FC = element(by.css('[data-currency-id="1"]'));
    FC.click();

    // confirm that the modal appears
    FU.exists(by.css('[uib-modal-window]'), true);
    FU.exists(by.name('CashboxModalForm'), true);

    // choose a random cash account
    FU.select('CashboxModalCtrl.data.account_id')
      .enabled()
      .last()
      .click();

    // choose a random transfer account
    FU.select('CashboxModalCtrl.data.transfer_account_id')
      .enabled()
      .last()
      .click();

    // submit the modal
    FU.modal.submit();

    // confirm that the success feedback message was displaced
    FU.exists(FU.feedback.success(), true);
  });

  // forget to change the gain exchange account id
  it('rejects a missing account on the currency modal', function () {

    // navigate to the update form for the second item
    update(2);

    // get a locator for the currencies
    var USD = element(by.css('[data-currency-id="2"]'));
    USD.click();

    // confirm that the modal appears
    FU.exists(by.css('[uib-modal-window]'), true);

    // choose a random cash account
    FU.select('CashboxModalCtrl.data.account_id')
      .enabled()
      .first()
      .click();

    // submit the modal
    FU.modal.submit();

    // confirm that the modal did not disappear
    FU.exists(by.css('[uib-modal-window]'), true);
    FU.exists(FU.feedback.error(), true);

    // these inputs should not have error states
    FU.validation.ok('CashboxModalCtrl.data.account_id');
    FU.validation.error('CashboxModalCtrl.data.transfer_account_id');

    // choose a random transfer account
    FU.select('CashboxModalCtrl.data.transfer_account_id')
      .enabled()
      .first()
      .click();

    // submit the modal
    FU.modal.submit();

    // confirm that the modal did not disappear
    FU.exists(by.css('[uib-modal-window]'), false);
    FU.exists(FU.feedback.error(), false);
  });

  it('allows you to delete a cashbox', function () {

    // navigate to the update form for the second item
    update(2);

    // click the "delete" button
    FU.buttons.delete();

    // confirm the deletion
    browser.switchTo().alert().accept();

    // check to see if we are in the default state
    FU.exists(by.css('.alert.alert-info'), true);
  });

  it('performs form validation', function () {

    // switch to the create form
    FU.buttons.create();

    // try to submit to the server.
    FU.buttons.submit();

    // everything should have error highlights
    FU.validation.error('CashCtrl.box.project_id');
    FU.validation.error('CashCtrl.box.label');
    FU.validation.error('CashCtrl.box.type');
  });
});
