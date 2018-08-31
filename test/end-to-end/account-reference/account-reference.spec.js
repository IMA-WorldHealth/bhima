/* loading chai and helpers */
const chai = require('chai');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

/* loading pages */
const AccountReferencePage = require('./account-reference.page.js');
const AccountReferenceCreateUpdatePage = require('./account-reference.cu.page.js');

/* configuring helpers */
helpers.configure(chai);

const { expect } = chai;

describe('AccountReference Management Page', () => {
  const path = '#/account_reference';
  const accountReferencePage = new AccountReferencePage();
  const accountReferenceCreateUpdatePage = new AccountReferenceCreateUpdatePage();
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
  let accountReferenceCount = 9;

  before(() => helpers.navigate(path));

  it('creates an accounts reference successfully', () => {
    accountReferencePage.createAccountReference();
    accountReferenceCreateUpdatePage.setAbbr(mockCreate.abbr);
    accountReferenceCreateUpdatePage.setDescription(mockCreate.description);
    accountReferenceCreateUpdatePage.setAccountValues(mockCreate.accounts);
    accountReferenceCreateUpdatePage.setAccountExceptionValues(mockCreate.accountsException);
    accountReferenceCreateUpdatePage.submit();

    accountReferenceCount++;
    components.notification.hasSuccess();
    expect(accountReferencePage.getAccountReferenceCount()).to.eventually.equal(accountReferenceCount);
  });

  it('edits an accounts reference successfully', () => {
    accountReferencePage.editAccountReference(9);
    accountReferenceCreateUpdatePage.clearSelectedItems();
    accountReferenceCreateUpdatePage.setAbbr(mockEdit.abbr);
    accountReferenceCreateUpdatePage.setDescription(mockEdit.description);
    accountReferenceCreateUpdatePage.setAccountValues(mockEdit.accounts, true);
    accountReferenceCreateUpdatePage.setAccountExceptionValues(mockEdit.accountsException, true);
    accountReferenceCreateUpdatePage.submit();

    components.notification.hasSuccess();
  });

  it('creates an accounts reference with a parent', () => {
    accountReferencePage.createAccountReference();
    accountReferenceCreateUpdatePage.setAbbr(mockCreate2.abbr);
    accountReferenceCreateUpdatePage.setDescription(mockCreate2.description);
    accountReferenceCreateUpdatePage.setAccountValues(mockCreate2.accounts);
    accountReferenceCreateUpdatePage.setAccountExceptionValues(mockCreate2.accountsException);
    accountReferenceCreateUpdatePage.setParentValue(mockCreate2.parent);
    accountReferenceCreateUpdatePage.submit();

    accountReferenceCount++;
    components.notification.hasSuccess();
    expect(accountReferencePage.getAccountReferenceCount()).to.eventually.equal(accountReferenceCount);
  });

  it('delete an accounts reference successfully', () => {
    accountReferencePage.deleteAccountReference(10);
    components.notification.hasSuccess();
    accountReferenceCount--;
  });

  it('displays all accountReferences loaded from the database', () => {
    expect(accountReferencePage.getAccountReferenceCount()).to.eventually.equal(accountReferenceCount);
  });
});
