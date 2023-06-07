const { chromium } = require('@playwright/test');
const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

const ConfigurationAnalysisTools = require('./configurationAnalysisTools.page');

test.describe('Configuration Analysis Tools', () => {

  let page;

  test.beforeEach(async () => {
    await TU.navigate('/#!/configuration_analysis_tools');
    page = await ConfigurationAnalysisTools.new();
  });

  const newConfiguration = {
    label : 'Subvention d\'exploitation',
    account_reference_id : 'Profits',
    analysis_tool_type_id : 'Profits',
  };

  const updateConfiguration = {
    label : 'Update Subvention Error',
    account_reference_id : 'Créditeurs',
    analysis_tool_type_id : 'Debts (Suppliers, Personal and Related Accounts)',
  };

  test('successfully creates a new Configuration Analysis', async () => {
    await page.create(newConfiguration);
  });

  test('successfully edits a Configuration Analysis', async () => {
    await page.update(newConfiguration.label, updateConfiguration);
  });

  test('errors when missing Configuration Analysis create when incorrect Configuration', async () => {
    await page.errorOnCreateConfigurationAnalysis();
  });

  test('begins with 5 Configuration Analysis', async () => {
    expect(await page.count()).toBe(5);
  });

  test('successfully delete Configuration Analysis', async () => {
    await page.remove(updateConfiguration.label);
  });
});
