/* global element, by, browser */

'use strict';

const chai = require('chai');
const expect = chai.expect;
const helpers = require('../shared/helpers');
helpers.configure(chai);

const FU = require('../shared/FormUtils');
const AccountsPage = require('./accounts.page.js');
const components = require('../shared/components');

describe('Account Management', function () {

  const path = '#/accounts';
  before(() => helpers.navigate(path));


  const INITIAL_ACCOUNTS = 14;
  let addedAccounts = 0;

  // this is an account at the top of the grid - until this test is improved it relies
  // on the account being visible to verify each test
  const accountGroup = {
    id : 3626,
    numberOfChildren : 3
  };

  const account = {
    id : 3636,
    number : 46000,
    type : 'Titre',
    label : 'Test Inventory Accounts',
    parent : {
      number : 40000
    }
  };

  const page = new AccountsPage();

  it('lists initial accounts', function () {
    page.expectGridRows(INITIAL_ACCOUNTS);
  });

  it('expands and collapses title accounts on title click', function () {
    page.toggleTitleRow(accountGroup.id);
    page.expectGridRows(INITIAL_ACCOUNTS - accountGroup.numberOfChildren);
    page.toggleTitleRow(accountGroup.id);
    page.expectGridRows(INITIAL_ACCOUNTS);
  });

  it('create state populates parent field through in-line create', function () {
    page.openAddChild(account.id);

    // this relies on the account select to display the account with account number
    expect(page.EditModal.parent()).to.eventually.include(account.number);
  });

  it('creates a single account', function () {
    FU.input('AccountEditCtrl.account.number', '46002');
    FU.input('AccountEditCtrl.account.label', 'Second Test Item Account');

    // relies on french translation
    FU.select('AccountEditCtrl.account.type_id', 'Titre').click();
    FU.buttons.submit();
    addedAccounts += 1;

    components.notification.hasSuccess();
  });

  it('edit state populates account data on clicking edit', function () {
    page.openEdit(account.id);
    expect(element(by.id('number-static')).getText()).to.eventually.equal(String(account.number));
    expect(element(by.id('type-static')).getText()).to.eventually.equal(account.type);
    expect(element(by.model('AccountEditCtrl.account.label')).getAttribute('value')).to.eventually.equal(account.label);
  });

  it('updates an account title and parent', function () {
    FU.input('AccountEditCtrl.account.label', 'Updated inventory accounts');
    FU.uiSelect('AccountEditCtrl.account.parent', 'Test Income');
    FU.buttons.submit();

    components.notification.hasSuccess();
  });

  const numberOfAccounts = 3;

  it('creates multiple accounts with the batch option selected', function () {
    var parentNumber = 70000;
    var mockAccount = {
      number : parentNumber,
      label : 'End to End Test: '
    };

    let select = $('body').element(by.model('AccountEditCtrl.account.type_id'));

    FU.buttons.create();

    // set modal to create any number of accounts
    page.toggleBatchCreate();

    // create top title account
    FU.input('AccountEditCtrl.account.number', mockAccount.number);
    FU.input('AccountEditCtrl.account.label', mockAccount.label.concat(0));

    select.element(by.css('[data-key="ACCOUNT.TYPES.TITLE"]')).click();

    FU.buttons.submit();
    addedAccounts += 1;

    // set to this parent
    FU.uiSelect('AccountEditCtrl.account.parent', parentNumber);
    // set to income
    select.element(by.css('[data-key="ACCOUNT.TYPES.INCOME"]')).click();

    for (let i = 1; i < numberOfAccounts; i++) {
      mockAccount.number += 20;
      createAccount(mockAccount, i);
    }

    mockAccount.number += 20;
    page.toggleBatchCreate();
    createAccount(mockAccount, numberOfAccounts);

    components.notification.hasSuccess();
  });

  it('displays all created accounts with model refresh', function () {
    browser.refresh();
    expect(page.getRowCount()).to.eventually.equal(INITIAL_ACCOUNTS + addedAccounts);
  });

  function createAccount(account, index) {
    FU.input('AccountEditCtrl.account.number', account.number);
    FU.input('AccountEditCtrl.account.label', account.label.concat(index));
    FU.buttons.submit();
    addedAccounts += 1;
  }
});
