/* global element, by, browser */

const { expect } = require('chai');
const helpers = require('../shared/helpers');

const FU = require('../shared/FormUtils');
const AccountsPage = require('./accounts.page.js');
const components = require('../shared/components');

describe('Account Management', () => {
  const path = '#/accounts';
  before(() => helpers.navigate(path));

  const INITIAL_ACCOUNTS = 28;
  const NUM_ADDED_ACCOUNTS = 4;

  // this is an account at the top of the grid - until this test is improved it relies
  // on the account being visible to verify each test
  const assetAccountGroup = {
    id : 9,
    numberOfChildren : 21,
  };

  const account = {
    id : 171,
    number : 41111000,
    type : 'Titre',
    label : 'End to End Test Debtor Account',
    parent : { number : 4011 },
  };

  const deletingAccount = '3645';

  const page = new AccountsPage();

  it('lists initial accounts', () => {
    page.expectGridRows(INITIAL_ACCOUNTS);
  });

  it('expands and collapses title accounts on title click', () => {
    page.toggleTitleRow(assetAccountGroup.id);
    page.expectGridRows(INITIAL_ACCOUNTS - assetAccountGroup.numberOfChildren);
    page.toggleTitleRow(assetAccountGroup.id);
    page.expectGridRows(INITIAL_ACCOUNTS);
  });

  it('create state populates parent field through in-line create', () => {
    page.openAddChild(account.id);

    // this relies on the account select to display the account with account number
    expect(page.EditModal.parent()).to.eventually.include(account.number);
  });

  it('creates a single account', () => {
    FU.input('AccountEditCtrl.account.number', '41111013');
    FU.input('AccountEditCtrl.account.label', 'IMA World Health');

    // FIXME(@jniles) - relies on french translation
    FU.select('AccountEditCtrl.account.type_id', 'Titre').click();
    FU.modal.submit();

    components.notification.hasSuccess();
  });

  it('edit state populates account data on clicking edit', () => {
    page.openEdit(account.id);
    expect(element(by.id('number-static')).getText()).to.eventually.equal(String(account.number));

    // @todo removed to allow types to be updated - this should be reintroduced
    // expect(element(by.id('type-static')).getText()).to.eventually.equal(account.type);
    expect(element(by.model('AccountEditCtrl.account.label')).getAttribute('value')).to.eventually.equal(account.label);
  });

  it('updates an account title and parent', () => {
    FU.input('AccountEditCtrl.account.label', 'Updated inventory accounts');
    FU.uiSelect('AccountEditCtrl.account.parent', 'Test Income');
    FU.modal.submit();

    components.notification.hasSuccess();
  });

  it('creates multiple accounts with the batch option selected', () => {
    const parentNumber = 7061; // Services vendus dans la Region ohada

    const accounts = [{
      number : 70611013,
      label : 'Pharmacie',
    }, {
      number : 70611014,
      label : 'Maternite',
    }, {
      number : 70611015,
      label : 'Maternite',
    }];

    const select = $('body').element(by.model('AccountEditCtrl.account.type_id'));

    FU.buttons.create();

    // set modal to create any number of accounts
    page.toggleBatchCreate();
    select.$('[data-key="ACCOUNT.TYPES.TITLE"]').click();

    // set to this parent
    FU.uiSelect('AccountEditCtrl.account.parent', parentNumber);

    // set to income
    select.element(by.css('[data-key="ACCOUNT.TYPES.REVENUE"]')).click();

    accounts.forEach(accnt => createAccount(accnt));

    page.toggleBatchCreate();

    createAccount({ number : 70611016, label : 'Laboratoire' });

    components.notification.hasSuccess();
  });

  it('displays all created accounts with model refresh', () => {
    browser.refresh();
    page.expectGridRows(INITIAL_ACCOUNTS + NUM_ADDED_ACCOUNTS);
  });

  // generic function to create an account in the modal
  function createAccount(accnt) {
    FU.input('AccountEditCtrl.account.number', accnt.number);
    FU.input('AccountEditCtrl.account.label', accnt.label);
    FU.modal.submit();
  }

  // Delete a specific Account
  it('can delete a specific account', () => {
    page.openEdit(deletingAccount);

    FU.buttons.delete();
    components.modalAction.confirm();

    components.notification.hasSuccess();
  });

  it('cannot delete an account with children', () => {
    page.openEdit(assetAccountGroup.id);
    FU.buttons.delete();
    components.modalAction.confirm();
    expect(element.all(by.css('[alert alert-danger]')));
  });
});
