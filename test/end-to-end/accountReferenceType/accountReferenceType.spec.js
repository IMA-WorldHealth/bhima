const { expect } = require('chai');
const helpers = require('../shared/helpers');
const AccountReferenceType = require('./accountReferenceType.page');

describe('Account Reference Type', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/account_reference_type'));

  const page = new AccountReferenceType();

  const newAccountReferenceType = {
    label : 'Test Account Reference Type',
  };

  const updateAccountReferenceType = {
    label : 'Update Account Reference Type',
  };

  it('begins with 2 Account Reference Type', () => {
    expect(page.count()).to.eventually.equal(2);
  });

  it('successfully creates a new Account Reference Type', () => {
    page.create(newAccountReferenceType);
  });

  it('successfully edits a Account Reference Type', () => {
    page.update(newAccountReferenceType.label, updateAccountReferenceType);
  });

  it('errors when missing Account Reference Type create when incorrect Account Reference Type', () => {
    page.errorOnCreateAccountReferenceType();
  });

  it('successfully delete Account Reference Type', () => {
    page.remove(updateAccountReferenceType.label);
  });
});
