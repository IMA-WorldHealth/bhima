/* global browser, element, by */

var chai = require('chai');
var expect = chai.expect;

// import testing utiliites
var components = require('../shared/components');
var FU = require('../shared/FormUtils');

var helpers = require('../shared/helpers');
helpers.configure(chai);

describe('Simple Vouchers', function () {
  'use strict';

  var path = '#/vouchers/simple';

  var voucher = {
    date : new Date((new Date()).getDate() - 1),
    toAccount : 'Test Debtor Group Account',
    fromAccount: '4600 - Test Inventory Accounts',
    description : 'Awesome description',
    amount : 100
  };

  beforeEach(function () {
    browser.get(path);
  });

  it('can create a simple voucher', function () {

    // configure the date to yesterday
    components.dateEditor.set(voucher.date);

    var option;

    // select the appropriate accounts
    FU.input('SimpleVoucherCtrl.voucher.toAccount', voucher.toAccount);
    option = element.all(by.repeater('match in matches track by $index')).last();
    option.click();

    FU.input('SimpleVoucherCtrl.voucher.fromAccount', voucher.fromAccount);
    option = element.all(by.repeater('match in matches track by $index')).last();
    option.click();

    // check the USD radio option
    element(by.css('[data-currency-option="2"]')).click();

    // input the amount
    components.currencyInput.set(voucher.amount);

    // submit the form
    FU.buttons.submit();

    // assert that validation text appears
    expect(element(by.css('.text-success')).isPresent()).to.eventually.equal(true);
  });

});
