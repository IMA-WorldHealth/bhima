const { expect } = require('chai');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

/* loading pages */
const AccountReferencePage = require('./account-reference.page.js');
const AccountReferenceCreateUpdatePage = require('./account-reference.cu.page.js');

describe.only('AccountReference Management Page', () => {
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

  const numReferences = 9;

  before(() => helpers.navigate(path));

  let page;
  beforeEach(() => {
    page = new AccountReferencePage();
  });

  it(`should begin with ${numReferences + 1} account references`, () => {
    expect(page.count()).to.eventually.equal(numReferences);
  });

  it('creates an accounts reference successfully', () => {
    page.create();

    const modal = new AccountReferenceCreateUpdatePage();

    modal.setAbbr(mockCreate.abbr);
    modal.setDescription(mockCreate.description);
    modal.setAccountValues(mockCreate.accounts);
    modal.setAccountExceptionValues(mockCreate.accountsException);
    components.accountReferenceTypeSelect.set(mockCreate.reference_type_id, 'reference_type_id');

    modal.submit();

    components.notification.hasSuccess();
    expect(page.count()).to.eventually.equal(numReferences + 1);
  });

  it('creates an accounts reference with a parent', () => {
    page.create();
    const modal = new AccountReferenceCreateUpdatePage();

    modal.setAbbr(mockCreate2.abbr);
    modal.setDescription(mockCreate2.description);
    modal.setAccountValues(mockCreate2.accounts);
    modal.setAccountExceptionValues(mockCreate2.accountsException);
    modal.setParentValue(mockCreate2.parent);
    modal.submit();

    components.notification.hasSuccess();
    expect(page.count()).to.eventually.equal(numReferences + 2);
  });

  it('edits an accounts reference successfully', () => {
    page.update(mockCreate2.abbr);
    const modal = new AccountReferenceCreateUpdatePage();
    modal.clearSelectedItems();
    modal.setAbbr(mockEdit.abbr);
    modal.setDescription(mockEdit.description);
    modal.setAccountValues(mockEdit.accounts, true);
    modal.setAccountExceptionValues(mockEdit.accountsException, true);
    modal.submit();

    components.notification.hasSuccess();
  });

  it('delete an accounts reference successfully', () => {
    page.remove(mockEdit.abbr);
    components.notification.hasSuccess();
    expect(page.count()).to.eventually.equal(numReferences + 1);
  });

  it(`should end with ${numReferences + 1} account references`, () => {
    expect(page.count()).to.eventually.equal(numReferences + 1);
  });
});
