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

  it('begins with 5 Account Reference Type', async () => {
    expect(await page.count()).to.equal(5);
  });

  it('successfully creates a new Account Reference Type', async () => {
    await page.create(newAccountReferenceType);
  });

  it('successfully edits a Account Reference Type', async () => {
    await page.update(newAccountReferenceType.label, updateAccountReferenceType);
  });

  it('errors when missing Account Reference Type create when incorrect Account Reference Type', async () => {
    await page.errorOnCreateAccountReferenceType();
  });

  it('successfully delete Account Reference Type', async () => {
    await page.remove(updateAccountReferenceType.label);
  });
});
