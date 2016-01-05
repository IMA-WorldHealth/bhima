/*global describe, it, element, by, beforeEach, inject, browser */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;

var FormUtils = require('../shared/FormUtils');

describe('The Cashbox Module', function () {

  // shared methods
  var path = '#/cashboxes';
  var CASHBOX = {
    name : 'Test Principal Cashbox',
    type : 1,  // this is the position in the radio button "principal"
    project : 1
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

    // submit the page to the server
    FormUtils.buttons.create();

    FormUtils.input('CashCtrl.box.text', CASHBOX.name);
    FormUtils.radio('CashCtrl.box.type', CASHBOX.type);

    // select a random, non-disabled option
    FormUtils.select('CashCtrl.box.project_id')
      .enabled()
      .first()
      .click();

    // submit the page to the server
    FormUtils.buttons.submit();

    // make sure the success message shows
    FormUtils.exists(FormUtils.feedback.success(), true);

    // click the cancel button
    FormUtils.buttons.cancel();

    // make sure the message is cleared
    FormUtils.exists(FormUtils.feedback.success(), false);
  });

  it('successfully edits a cashbox', function () {

    // navigate to the update form for the second item
    update(2);

    FormUtils.input('CashCtrl.box.text', 'New Cashbox Name');
    FormUtils.radio('CashCtrl.box.type', CASHBOX.type);

    // make sure no messages are displayed
    FormUtils.exists(FormUtils.feedback.success(), false);

    FormUtils.buttons.submit();

    // success message!
    FormUtils.exists(FormUtils.feedback.success(), true);
  });

  it('allows the user to change currency accounts', function () {

    // navigate to the update form for the second item
    update(2);

    // get a locator for the currencies
    var fc =
      element.all(by.repeater('currency in CashCtrl.currencies | orderBy:currency.name track by currency.id')).get(0);

    // click the first currency button
    fc.$$('a').click();

    // confirm that the modal appears
    FormUtils.exists(by.css('[uib-modal-window]'), true);
    FormUtils.exists(by.name('CashboxModalForm'), true);

    // choose a random cash account
    FormUtils.select('CashboxModalCtrl.data.account_id')
      .enabled()
      .last()
      .click();

    // choose a random loss on exchange account
    FormUtils.select('CashboxModalCtrl.data.loss_exchange_account_id')
      .enabled()
      .last()
      .click();

    // choose a random gain on exchange account
    FormUtils.select('CashboxModalCtrl.data.gain_exchange_account_id')
      .enabled()
      .last()
      .click();

    // choose a random transfer account
    FormUtils.select('CashboxModalCtrl.data.virement_account_id')
      .enabled()
      .last()
      .click();

    // submit the modal
    FormUtils.modal.submit();

    // confirm that the success feedback message was displaced
    FormUtils.exists(FormUtils.feedback.success(), true);
  });

  // forget to change the gain exchange account id
  it('rejects a missing account on the currency modal', function () {

    // navigate to the update form for the second item
    update(2);

    // get a locator for the currencies
    var fc =
      element.all(by.repeater('currency in CashCtrl.currencies | orderBy:currency.name track by currency.id')).get(1);

    // click the first currency button
    fc.$$('a').click();

    // confirm that the modal appears
    FormUtils.exists(by.css('[uib-modal-window]'), true);

    // NOTE -- we are forgetting to change the gain account id!

    // choose a random cash account
    FormUtils.select('CashboxModalCtrl.data.account_id')
      .enabled()
      .first()
      .click();

    // choose a random loss on exchange account
    FormUtils.select('CashboxModalCtrl.data.loss_exchange_account_id')
      .enabled()
      .first()
      .click();

    // choose a random transfer account
    FormUtils.select('CashboxModalCtrl.data.virement_account_id')
      .enabled()
      .first()
      .click();

    // submit the modal
    FormUtils.modal.submit();

    // confirm that the modal did not disappear
    FormUtils.exists(by.css('[uib-modal-window]'), true);
    FormUtils.exists(FormUtils.feedback.error(), true);

    // select a valid currency account
    FormUtils.select('CashboxModalCtrl.data.gain_exchange_account_id')
      .enabled()
      .first()
      .click();

    // submit the modal
    FormUtils.modal.submit();

    // confirm that the modal did not disappear
    FormUtils.exists(by.css('[uib-modal-window]'), false);
    FormUtils.exists(FormUtils.feedback.error(), false);
  });

  it('allows you to delete a cashbox', function () {

    // navigate to the update form for the second item
    update(2);

    // click the "delete" button
    FormUtils.buttons.delete();

    // confirm the deletion
    browser.switchTo().alert().accept();

    // check to see if we are in the default state
    FormUtils.exists(by.css('.alert.alert-info'), true);
  });

});
