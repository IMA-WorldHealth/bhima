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
    abbr : 'AO',
    description : 'Updated Test Accounts Reference',
    is_amo_dep : 1,
    accounts : ['31110010', '31110011'],
    accountsException : ['31110011'],
  };

  const numReferences = 0;

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
    modal.submit();

    components.notification.hasSuccess();
    expect(page.count()).to.eventually.equal(numReferences + 1);
  });

  it('edits an accounts reference successfully', () => {
    page.update(mockCreate.abbr);
    const modal = new AccountReferenceCreateUpdatePage();
    modal.clearSelectedItems();
    modal.setAbbr(mockEdit.abbr);
    modal.setDescription(mockEdit.description);
    modal.setAccountValues(mockEdit.accounts, true);
    modal.setAccountExceptionValues(mockEdit.accountsException, true);
    modal.submit();

    components.notification.hasSuccess();
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

  it('delete an accounts reference successfully', () => {
    page.remove(mockCreate2.abbr);
    components.notification.hasSuccess();
    expect(page.count()).to.eventually.equal(numReferences + 1);
  });

  it(`should end with ${numReferences + 1} account references`, () => {
    expect(page.count()).to.eventually.equal(numReferences + 1);
  });
});
