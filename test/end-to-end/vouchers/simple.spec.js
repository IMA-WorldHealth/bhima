/* global browser, element, by */
const components = require('../shared/components');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');

describe('Simple Vouchers', function () {
  'use strict';

  before(() => helpers.navigate('#/vouchers/simple'));

  /*
   * TODO - why does this not work on midnight JAN 1 2017?
  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  */

  const voucher = {
    date: new Date(),
    type: 'Transfer',
    toAccount: 'Test Debtor Group Account',
    fromAccount: 'First Test Item Account',
    description: 'Awesome description',
    amount: 100.12
  };

  it('can create a simple voucher', function () {

    // configure the date to yesterday
    components.dateEditor.set(voucher.date);

    FU.input('SimpleVoucherCtrl.Voucher.details.description', voucher.description);
    FU.uiSelect('SimpleVoucherCtrl.Voucher.details.type_id', voucher.type);

    // select the appropriate accounts
    FU.uiSelect('SimpleVoucherCtrl.Voucher.store.data[0].account_id', voucher.fromAccount);
    FU.uiSelect('SimpleVoucherCtrl.Voucher.store.data[1].account_id', voucher.toAccount);

    components.currencySelect.set(2);
    components.currencyInput.set(voucher.amount);

    // submit the form
    FU.buttons.submit();

    // make sure a receipt is displayed
    FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    FU.modal.close();
  });
});
