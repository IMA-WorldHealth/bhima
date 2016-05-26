/* global browser, element, by */
const chai = require('chai');
const expect = chai.expect;

const components = require('../shared/components');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe('Simple Vouchers', function () {
  'use strict';

  before(() => helpers.navigate('#/vouchers/simple'));

  const voucher = {
    date : new Date((new Date()).getDate() - 1),
    toAccount : 'Test Debtor Group Account',
    fromAccount: '4600 - Test Inventory Accounts',
    description : 'Awesome description',
    amount : 100
  };

  it('can create a simple voucher', function () {

    // configure the date to yesterday
    components.dateEditor.set(voucher.date);

    // select the appropriate accounts
    FU.typeahead('SimpleVoucherCtrl.voucher.toAccount', voucher.toAccount);
    FU.typeahead('SimpleVoucherCtrl.voucher.fromAccount', voucher.fromAccount);

    // check the USD radio option
    element(by.css('[data-currency-option="2"]')).click();

    // input the amount
    components.currencyInput.set(voucher.amount);

    // submit the form
    FU.buttons.submit();

    // assert that validation text appears
    expect(element(by.css('.alert-success')).isPresent()).to.eventually.equal(true);
  });
});
