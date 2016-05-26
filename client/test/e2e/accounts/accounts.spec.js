/* global element, by, browser */

/*
 * @todo - this should have it's own Accounts Page Object.  It is complex enough.
 */

const chai = require('chai');
const expect = chai.expect;
const helpers = require('../shared/helpers');
helpers.configure(chai);

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

describe('Accounts', function () {
  const path = '#/accounts';
  before(() => helpers.navigate(path));

  const accountBalance = {
    label : 'Compte de Balance',
    type : 'balance',
    is_asset : 1,
    number : '4503500'
  };

  const accountIncomeExpense = {
    label : 'Compte Income Expence',
    type : 'income/expense',
    is_charge : 0,
    number : '3384012'
  };

  const accountRank = 7;

  it('creates a new account type balance', function () {
    FU.buttons.create();

    FU.input('AccountsCtrl.account.label', accountBalance.label);
    FU.select('AccountsCtrl.account.type', accountBalance.type);
    FU.radio('AccountsCtrl.account.is_asset', accountBalance.is_asset);
    FU.input('AccountsCtrl.account.number', accountBalance.number);
    FU.select('AccountsCtrl.account.reference_id', 'Reference bilan 1');

    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });

  it('edits an account', function () {
    element(by.id('account-upd-' + accountRank )).click();

    // modify the account name
    FU.input('AccountsCtrl.account.label', ' Updated');

    element(by.id('locked')).click();
    element(by.id('change_account')).click();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });

  it('unlock an account', function () {
    element(by.id('account-upd-' + accountRank )).click();
    element(by.id('locked')).click();
    element(by.id('change_account')).click();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });

  it('creates a new account type income expense', function () {
    FU.buttons.create();

    FU.input('AccountsCtrl.account.label', accountIncomeExpense.label);
    FU.select('AccountsCtrl.account.type', accountIncomeExpense.type);
    FU.input('AccountsCtrl.account.number', accountIncomeExpense.number);
    FU.radio('AccountsCtrl.account.is_charge', accountIncomeExpense.is_charge);
    FU.select('AccountsCtrl.account.cc_id', 'cost center 1');
    FU.select('AccountsCtrl.account.reference_id', 'Reference bilan 1');

    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });

  it('blocks invalid form submission with relevant error classes', function () {
    FU.buttons.create();

    // verify form has not been submitted
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
