const helpers = require('../shared/helpers');
const AccountConfigPage = require('./account_config.page');
const chai = require('chai');


/** configuring helpers**/
helpers.configure(chai);

describe('Account Configuration Management', () => {
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

  it('successfully creates a Configuration Account', () => {
    Page.createAccountConfig(accountConfig);
  });

  it('successfully edits a Configuration Account', () => {
    Page.editAccountConfig(accountConfig.label, updateAccountConfig);
  });

  it('don\'t create when incorrect Configuration Account', () => {
    Page.errorOnCreateAccountConfig();
  });

  it('successfully delete a Configuration Account', () => {
    Page.deleteAccountConfig(updateAccountConfig.label);
  });

});