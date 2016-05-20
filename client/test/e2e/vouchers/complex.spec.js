/* global browser, element, by, protractor */
const chai = require('chai');
const expect = chai.expect;

// import testing utilities
const helpers = require('../shared/helpers');
helpers.configure(chai);

// import testint components
const components = require('../shared/components');
const FU = require('../shared/FormUtils');
const GU = require('../shared/gridTestUtils.spec');

describe('Complex voucher Test :: ', function () {

  'use strict';

  before(() => browser.get('#/vouchers/complex'));

  const voucher = {
    date : new Date(),
    description : 'Complex voucher test e2e',
    amount : 700
  };

  const rows = [
    { account : 'Test Debtor', debit : '17', credit : '0' },
    { account : 'Test Capital One', debit : '0', credit : '7' },
    { account : 'Test Capital Two', debit : '0', credit : '5' },
    { account : 'Test Balance', debit : '0', credit : '5' }
  ];

  const documents = {
    debtor : 'Anonymous',
    creditor : 'Perso'
  };

  it('Create complex voucher', function () {
    var option;

    // configure the date to today
    components.dateEditor.set(voucher.date);

    // set the description
    FU.input('ComplexVoucherCtrl.voucher.description', voucher.description);

    // set the currency
    element(by.css('[data-currency-option="1"]')).click();
    element(by.css('[data-currency-option="2"]')).click();

    // add two lines of transactions
    element(by.css('[data-button-add-item]')).click();
    element(by.css('[data-button-add-item]')).click();

    // first line
    //  set the account
    element(by.css('[data-account-row="0"]')).sendKeys(rows[0].account);
    option = element.all(by.repeater('match in matches track by $index')).first();
    option.click();

    //  set the debit
    element(by.css('[data-debit-row="0"]')).clear().sendKeys(rows[0].debit);

    //  set the credit
    element(by.css('[data-credit-row="0"]')).clear().sendKeys(rows[0].credit);

    //  set the document entity
    element(by.css('[data-entity-row="0"]')).click();

    //  select the debtor option in the find entity modal
    element(by.css('[uib-dropdown-toggle]')).click();
    option = element.all(by.repeater('type in $ctrl.types')).first();
    option.click();

    //  set the debtor in the find entity modal
    element(by.model('$ctrl.entity')).sendKeys(documents.debtor);
    option = element.all(by.repeater('match in matches track by $index')).first();
    option.click();

    // submit the selection
    element(by.css('[data-button-submit]')).click();

    // second line
    //  set the account
    element(by.css('[data-account-row="1"]')).sendKeys(rows[1].account);
    option = element.all(by.repeater('match in matches track by $index')).first();
    option.click();

    //  set the debit
    element(by.css('[data-debit-row="1"]')).clear().sendKeys(rows[1].debit);

    //  set the credit
    element(by.css('[data-credit-row="1"]')).clear().sendKeys(rows[1].credit);

    // set the document reference
    element(by.css('[data-reference-row="1"]')).click();

    // select the voucher option in the document reference modal
    element(by.css('[data-button-voucher]')).click();

    // select the second element in the voucher list
    GU.selectRow('referenceGrid', 0);

    // submit the selection
    element(by.css('[data-button-submit]')).click();

    // third line
    //  set the account
    element(by.css('[data-account-row="2"]')).sendKeys(rows[1].account);
      option = element.all(by.repeater('match in matches track by $index')).first();
      option.click();

    //  set the debit
    element(by.css('[data-debit-row="2"]')).clear().sendKeys(rows[2].debit);

    //  set the credit
    element(by.css('[data-credit-row="2"]')).clear().sendKeys(rows[2].credit);

    // set the document reference
    element(by.css('[data-reference-row="2"]')).click();

    // select the voucher option in the document reference modal
    element(by.css('[data-button-voucher]')).click();

    // select the second element in the voucher list
    GU.selectRow('referenceGrid', 1);

    // submit the selection
    element(by.css('[data-button-submit]')).click();

    // fourth line
    //  set the account
    element(by.css('[data-account-row="3"]')).sendKeys(rows[3].account);
    option = element.all(by.repeater('match in matches track by $index')).first();
    option.click();

    //  set the debit
    element(by.css('[data-debit-row="3"]')).clear().sendKeys(rows[3].debit);

    //  set the credit
    element(by.css('[data-credit-row="3"]')).clear().sendKeys(rows[3].credit);

    // set the document reference
    element(by.css('[data-reference-row="3"]')).click();

    // select the voucher option in the document reference modal
    element(by.css('[data-button-voucher]')).click();

    // select the second element in the voucher list
    GU.selectRow('referenceGrid', 2);

    // submit the selection
    element(by.css('[data-button-submit]')).click();

    // ---------------- submit ---------------------
    element(by.css('[data-submit]')).click();

    expect(element(by.id('create-success'))).to.be.exist;

  });

});
