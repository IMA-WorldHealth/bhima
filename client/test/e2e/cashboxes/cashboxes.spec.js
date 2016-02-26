/*global element, by, beforeEach, browser */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
chai.use(chaiAsPromised);

var FU = require('../shared/FormUtils');

describe('Cashbox Module', function () {

  var path = '#/cashboxes';
  var cashbox = {
    name:    'Test Principal Cashbox',
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

    FU.input('CashCtrl.box.text', cashbox.name);
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
    update(2);

    FU.input('CashCtrl.box.text', 'New Cashbox Name');
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

    // choose a random loss on exchange account
    FU.select('CashboxModalCtrl.data.loss_exchange_account_id')
      .enabled()
      .last()
      .click();

    // choose a random gain on exchange account
    FU.select('CashboxModalCtrl.data.gain_exchange_account_id')
      .enabled()
      .last()
      .click();

    // choose a random transfer account
    FU.select('CashboxModalCtrl.data.virement_account_id')
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

    // NOTE -- we are forgetting to change the gain account id!

    // choose a random cash account
    FU.select('CashboxModalCtrl.data.account_id')
      .enabled()
      .first()
      .click();

    // choose a random loss on exchange account
    FU.select('CashboxModalCtrl.data.loss_exchange_account_id')
      .enabled()
      .first()
      .click();

    // choose a random transfer account
    FU.select('CashboxModalCtrl.data.virement_account_id')
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
    FU.validation.ok('CashboxModalCtrl.data.loss_exchange_account_id');
    FU.validation.ok('CashboxModalCtrl.data.virement_account_id');

    // this input should show an error state to the user
    FU.validation.error('CashboxModalCtrl.data.gain_exchange_account_id');

    // select a valid currency account
    FU.select('CashboxModalCtrl.data.gain_exchange_account_id')
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
    FU.validation.error('CashCtrl.box.text');
    FU.validation.error('CashCtrl.box.type');
  });
});
