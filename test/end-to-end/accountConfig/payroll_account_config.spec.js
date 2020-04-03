const helpers = require('../shared/helpers');
const AccountConfigPage = require('./payroll_account_config.page');

describe('Payroll Account Configuration Management', () => {
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

  it('successfully creates a configuration account', async () => {
    await Page.createAccountConfig(accountConfig);
  });

  it('successfully edits a configuration account', async () => {
    await Page.editAccountConfig(accountConfig.label, updateAccountConfig);
  });

  it('does not create an incorrect configuration account', async () => {
    await Page.errorOnCreateAccountConfig();
  });

  it('successfully deletes a configuration account', async () => {
    await Page.deleteAccountConfig(updateAccountConfig.label);
  });
});
