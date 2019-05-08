const chai = require('chai');
const helpers = require('../shared/helpers');
const AccountConfigPage = require('./payroll_account_config.page');

helpers.configure(chai);

describe('Payroll Account Configuration Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/payroll/account_configuration'));

  const Page = new AccountConfigPage();

  const accountConfig = {
    label : 'Configuration Account 2017',
    account_id : '40111002',
  };

  const updateAccountConfig = {
    label : 'Configuration Account 2018',
    account_id : '57110010',
  };

  it('successfully creates a Configuration Account', async () => {
    await Page.createAccountConfig(accountConfig);
  });

  it('successfully edits a Configuration Account', async () => {
    await Page.editAccountConfig(accountConfig.label, updateAccountConfig);
  });

  it('don\'t create when incorrect Configuration Account', async () => {
    await Page.errorOnCreateAccountConfig();
  });

  it('successfully delete a Configuration Account', async () => {
    await Page.deleteAccountConfig(updateAccountConfig.label);
  });
});
