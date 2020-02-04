const { expect } = require('chai');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

/* loading pages */
const AccountReferencePage = require('./account-reference.page.js');
const AccountReferenceCreateUpdatePage = require('./account-reference.cu.page.js');

describe('AccountReference Management Page', () => {
  const path = '#/account_reference';
  const mockCreate = {
    abbr : 'AO',
    description : 'Test Accounts Reference',
    is_amo_dep : 0,
    accounts : ['31110010', '31110011', '57110010', '57110011'],
    accountsException : ['31110011', '57110011'],
    reference_type_id : 'Compte de Résultat',
  };

  const mockCreate2 = {
    abbr : 'AA',
    description : 'Test Accounts Reference',
    is_amo_dep : 0,
    accounts : ['31110010', '31110011', '57110010', '57110011'],
    accountsException : ['31110011', '57110011'],
    parent : 'AO',
  };

  const mockEdit = {
    abbr : 'BD',
    description : 'Updated Test Accounts Reference',
    is_amo_dep : 1,
    accounts : ['31110010', '31110011'],
    accountsException : ['31110011'],
  };

  const mockSearch = {
    abbr : 'p_test_3',
    description : 'Test 3',
    account : '603',
    reference_type_id : 'Compte de Résultat',
    accountNull : '1013',
  };

  const numReferences = 13;

  before(() => helpers.navigate(path));

  let page;
  beforeEach(() => {
    page = new AccountReferencePage();
  });

  it(`should begin with ${numReferences + 1} account references`, async () => {
    expect(await page.count()).to.equal(numReferences);
  });

  it('creates an account reference successfully', async () => {
    await page.create();

    const modal = new AccountReferenceCreateUpdatePage();

    await modal.setAbbr(mockCreate.abbr);
    await modal.setDescription(mockCreate.description);
    await modal.setAccountValues(mockCreate.accounts);
    await modal.setAccountExceptionValues(mockCreate.accountsException);
    await components.accountReferenceTypeSelect.set(mockCreate.reference_type_id, 'reference_type_id');

    await modal.submit();

    await components.notification.hasSuccess();
    expect(await page.count()).to.equal(numReferences + 1);
  });

  it('creates an accounts reference with a parent', async () => {
    await page.create();
    const modal = new AccountReferenceCreateUpdatePage();

    await modal.setAbbr(mockCreate2.abbr);
    await modal.setDescription(mockCreate2.description);
    await modal.setAccountValues(mockCreate2.accounts);
    await modal.setAccountExceptionValues(mockCreate2.accountsException);
    await modal.setParentValue(mockCreate2.parent);
    await modal.submit();

    await components.notification.hasSuccess();
    expect(await page.count()).to.equal(numReferences + 2);
  });

  it('edits an accounts reference successfully', async () => {
    await page.update(mockCreate2.abbr);
    const modal = new AccountReferenceCreateUpdatePage();
    await modal.clearSelectedItems();
    await modal.setAbbr(mockEdit.abbr);
    await modal.setDescription(mockEdit.description);
    await modal.setAccountValues(mockEdit.accounts, true);
    await modal.setAccountExceptionValues(mockEdit.accountsException, true);
    await modal.submit();

    await components.notification.hasSuccess();
  });

  it('Search account references by Description', async () => {
    await page.search();
    const modal = new AccountReferenceCreateUpdatePage();
    await modal.searchDescription(mockSearch.description);

    await modal.submit();
    expect(await page.count()).to.equal(2);
    await modal.clearFilter();
  });

  it('Search account references by Account Number', async () => {
    await page.search();
    const modal = new AccountReferenceCreateUpdatePage();
    await modal.searchAccount(mockSearch.account);

    await modal.submit();
    expect(await page.count()).to.equal(3);
    await modal.clearFilter();
  });

  it('Search account references by Account Number', async () => {
    await page.search();
    const modal = new AccountReferenceCreateUpdatePage();
    await modal.searchAccount(mockSearch.accountNull);

    await modal.submit();
    expect(await page.count()).to.equal(0);
    await modal.clearFilter();
  });

  it('Search account references by Reference Account Type', async () => {
    await page.search();
    const modal = new AccountReferenceCreateUpdatePage();
    await modal.searchReferenceType(mockSearch.reference_type_id);

    await modal.submit();
    expect(await page.count()).to.equal(1);
    await modal.clearFilter();
  });

  it('delete an accounts reference successfully', async () => {
    await page.remove(mockEdit.abbr);
    await components.notification.hasSuccess();
    expect(await page.count()).to.equal(numReferences + 1);
  });

  it(`should end with ${numReferences + 1} account references`, async () => {
    expect(await page.count()).to.equal(numReferences + 1);
  });

  it('Search account references by Reference', async () => {
    await page.search();
    const modal = new AccountReferenceCreateUpdatePage();
    await modal.searchAbbr(mockSearch.abbr);

    await modal.submit();
    expect(await page.count()).to.equal(1);
    await modal.clearFilter();
  });
});
