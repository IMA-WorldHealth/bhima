/* global element, by, browser */
const { expect } = require('chai');
const helpers = require('../shared/helpers');

const FU = require('../shared/FormUtils');
const AccountsPage = require('./accounts.page.js');
const components = require('../shared/components');

describe('Account Management', () => {
  const path = '#/accounts';
  before(() => helpers.navigate(path));

  const INITIAL_ACCOUNTS = 20;
  const OHADA_ACCOUNTS_CSV_FILE = 'ohada-accounts.csv';
  const OHADA_ACCOUNTS_CSV_CHARACTERS_FILE = 'ohada-accounts-characters.csv';
  const BAD_OHADA_ACCOUNTS_CSV_FILE = 'bad-ohada-accounts.csv';

  // this is an account at the top of the grid - until this test is improved it
  // relies on the account being visible to verify each test
  const assetAccountGroup = {
    number : 10,
    child_number : 105, // this is the number ofthe  child account in the group
  };

  const account = {
    number : '10911010',
    type : 'Capital',
    label : 'Compte Actionnaire, Capital souscrit, non appelé',
    parent : { number : '1091' },
  };

  const DELETE_ACCOUNT_NUMBER = 10541010;

  const page = new AccountsPage();

  it('lists initial accounts', async () => {
    await page.expectGridRowsAtLeast(INITIAL_ACCOUNTS);
  });

  it('expands and collapses title accounts on title click', async () => {
    await page.expectRowVisible(assetAccountGroup.child_number);
    await page.toggleTitleRow(assetAccountGroup.number);
    await page.expectRowHidden(assetAccountGroup.child_number);
    await page.toggleTitleRow(assetAccountGroup.number);
  });

  it('create state populates parent field through in-line create', async () => {
    await page.openAddChild(account.parent.number);

    // this relies on the account select to display the account with account number
    expect(await page.EditModal.parent()).to.include(account.parent.number);
    await FU.modal.cancel();
  });

  it('creates a single account', async () => {
    await page.openAddChild(account.parent.number);
    await FU.input('AccountEditCtrl.account.number', '41111019');
    await FU.input('AccountEditCtrl.account.label', 'IMA World Health Account');

    // FIXME(@jniles) - relies on french translation
    await FU.select('AccountEditCtrl.account.type_id', 'Titre').click();
    await FU.modal.submit();

    await components.notification.hasSuccess();
  });

  it('edit state populates account data on clicking edit', async () => {
    await page.openEdit(account.number);
    expect(await element(by.id('number-static')).getText()).to.equal(String(account.number));

    // @todo removed to allow types to be updated - this should be reintroduced
    expect(await element(by.id('type-static')).getText()).to.equal(account.type);
    expect(
      await element(by.model('AccountEditCtrl.account.label')).getAttribute('value'),
    ).to.equal(account.label);
  });

  it('updates an account title and parent', async () => {
    await FU.input('AccountEditCtrl.account.label', 'Updated Inventory Accounts');
    await FU.uiSelect('AccountEditCtrl.account.parent', 'Médicaments');
    await FU.modal.submit();

    await components.notification.hasSuccess();
  });

  it('creates multiple accounts with the batch option selected', async () => {
    const parentNumber = '7061'; // Services vendus dans la Region ohada

    const accounts = [{
      number : '70611013',
      label : 'Pharmacie',
    }, {
      number : '70611014',
      label : 'Maternite',
    }, {
      number : '70611015',
      label : 'Maternite',
    }];

    const select = $('body').element(by.model('AccountEditCtrl.account.type_id'));

    await FU.buttons.create();

    // expect the modal to open
    await FU.exists(by.css('[uib-modal-window]'), true);

    // set modal to create any number of accounts
    await page.toggleBatchCreate();
    await select.$('[data-key="ACCOUNT.TYPES.TITLE"]').click();

    // set to this parent
    await FU.uiSelect('AccountEditCtrl.account.parent', parentNumber);

    // set to income
    await select.element(by.css('[data-key="ACCOUNT.TYPES.INCOME"]')).click();

    // eslint-disable-next-line
    for (const accnt of accounts) {
    // eslint-disable-next-line
      await createAccount(accnt);
    }

    await page.toggleBatchCreate();

    await createAccount({ number : '70611016', label : 'Laboratoire' });

    await components.notification.hasSuccess();
  });

  // generic function to create an account in the modal
  async function createAccount(accnt) {
    await FU.input('AccountEditCtrl.account.number', accnt.number);
    await FU.input('AccountEditCtrl.account.label', accnt.label);
    await FU.modal.submit();
  }

  // delete a specific account
  it('can delete a specific account', async () => {
    // FIXME(@jniles) - account page does not refresh the grid on updates
    await browser.refresh();
    await page.deleteAccount(DELETE_ACCOUNT_NUMBER);
    await components.notification.hasSuccess();
  });

  it('cannot delete an account with children', async () => {
    await page.deleteAccount(assetAccountGroup.number);
    await components.notification.hasError();
  });

  // import default ohada accounts accounts
  it('import default ohada accounts into the system', async () => {
    await page.openImportMenu();

    await page.chooseImportOption(0);
    await FU.modal.submit();
    await components.notification.hasSuccess();
  });

  // import custom ohada accounts
  it('import default ohada accounts into the system', async () => {
    await page.openImportMenu();

    await page.chooseImportOption(1);
    await page.uploadFile(OHADA_ACCOUNTS_CSV_FILE);
    await FU.modal.submit();
    await components.notification.hasSuccess();
  });

  // import custom ohada accounts from csv of strings
  it('import default ohada accounts from csv of strings', async () => {
    await page.openImportMenu();

    await page.chooseImportOption(1);
    await page.uploadFile(OHADA_ACCOUNTS_CSV_CHARACTERS_FILE);
    await FU.modal.submit();
    await components.notification.hasSuccess();
  });

  // import custom ohada accounts
  it('don\'t import accounts from bad file', async () => {
    await page.openImportMenu();

    await page.chooseImportOption(1);
    await page.uploadFile(BAD_OHADA_ACCOUNTS_CSV_FILE);
    await FU.modal.submit();
    await components.notification.hasError();
  });
});
