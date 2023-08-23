const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

const AccountConfigPage = require('./payroll_account_config.page');

test.describe('Payroll Account Configuration Management', () => {
  test.beforeEach(async () => {
    await TU.navigate('/#!/payroll/account_configuration');
  });

  const Page = new AccountConfigPage();

  const accountConfig = {
    label : 'Configuration Account 2017',
    account_id : '40111002',
  };

  const updateAccountConfig = {
    label : 'Configuration Account 2018',
    account_id : '57110010',
  };

  test('successfully creates a configuration account', async () => {
    await Page.createAccountConfig(accountConfig);
  });

  test('successfully edits a configuration account', async () => {
    await Page.editAccountConfig(accountConfig.label, updateAccountConfig);
  });

  test('does not create an incorrect configuration account', async () => {
    await Page.errorOnCreateAccountConfig();
  });

  test('successfully deletes a configuration account', async () => {
    await Page.deleteAccountConfig(updateAccountConfig.label);
  });
});
