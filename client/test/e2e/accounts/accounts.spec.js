/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const helpers = require('../shared/helpers');
helpers.configure(chai);

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

describe('Accounts Module', function () {
  'use strict';

  const path = '#/accounts';
  before(() => helpers.navigate(path));

  const accountBalance = {
    label : 'Compte de Balance',
    type : 'balance',
    is_asset : 1,
    number : '4503500'
  };

  const accountIncomeExpence = {
    label : 'Compte Income Expence',
    type : 'income/expense',
    is_charge : 0,
    number : '3384012'
  };

  const accountRank = 7;

  it('successfully creates a new account type balance', function () {

    // switch to the create form
    FU.buttons.create();
    FU.input('AccountsCtrl.account.label', accountBalance.label);
    element(by.model('AccountsCtrl.account.type')).element(by.cssContainingText('option', accountBalance.type)).click();
    FU.radio('AccountsCtrl.account.is_asset', accountBalance.is_asset);
    FU.input('AccountsCtrl.account.number', accountBalance.number);

    // select a Reference
    FU.select('AccountsCtrl.account.reference_id')
      .enabled()
      .first()
      .click();

    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });

  it('successfully edits an account', function () {
    element(by.id('account-upd-' + accountRank )).click();

    // modify the account name
    FU.input('AccountsCtrl.account.label', ' Updated');


    element(by.id('locked')).click();
    element(by.id('change_account')).click();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });

  it('successfully unlock an account', function () {
    element(by.id('account-upd-' + accountRank )).click();
    element(by.id('locked')).click();
    element(by.id('change_account')).click();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });

  it('successfully creates a new account type income expense', function () {

    // swtich to the create form
    FU.buttons.create();
    FU.input('AccountsCtrl.account.label', accountIncomeExpence.label);
    element(by.model('AccountsCtrl.account.type')).element(by.cssContainingText('option', accountIncomeExpence.type)).click();
    FU.input('AccountsCtrl.account.number', accountIncomeExpence.number);
    FU.radio('AccountsCtrl.account.is_charge', accountIncomeExpence.is_charge);

    // select a Profit Center
    FU.select('AccountsCtrl.account.cc_id')
      .enabled()
      .first()
      .click();

    // select a Reference
    FU.select('AccountsCtrl.account.reference_id')
      .enabled()
      .first()
      .click();

    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });


  it('correctly blocks invalid form submission with relevant error classes', function () {
    // switch to the create form
    FU.buttons.create();

    // verify form has not been successfully submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    element(by.id('submit-account')).click();

    // the following fields should be required
    FU.validation.error('AccountsCtrl.account.label');
    FU.validation.error('AccountsCtrl.account.type');
    FU.validation.error('AccountsCtrl.account.number');

    // the following fields are not required
    FU.validation.ok('AccountsCtrl.account.is_title');
    FU.validation.ok('AccountsCtrl.account.parent');
  });
});
