/* global browser, element, by */
const components = require('../shared/components');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');

describe('Simple Vouchers', function () {
  'use strict';

  before(() => helpers.navigate('#/vouchers/simple'));

  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const voucher = {
    date: yesterday,
    type: 'transfer',
    toAccount: 'Test Debtor Group Account',
    fromAccount: 'Updated inventory accounts',
    description: 'Awesome description',
    amount: 100.12
  };

  it('can create a simple voucher', function () {

    // configure the date to yesterday
    components.dateEditor.set(voucher.date);

    FU.input('SimpleVoucherCtrl.voucher.description', voucher.description);
    element(by.model('SimpleVoucherCtrl.selectedType')).click();
    element(by.css('[data-item="1"]')).click();

    // select the appropriate accounts
    FU.typeahead('SimpleVoucherCtrl.voucher.fromAccount', voucher.fromAccount);
    FU.typeahead('SimpleVoucherCtrl.voucher.toAccount', voucher.toAccount);

    components.currencySelect.set(2);
    components.currencyInput.set(voucher.amount);

    // submit the form
    FU.buttons.submit();

    // is the modal is openned
    FU.exists(by.css('[data-modal-box]'), true);

    // close the modal
    FU.modal.close();
  });
});
