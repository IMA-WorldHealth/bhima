const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const JournalConfigurationTests = require('./ConfigurationModal.tests');
const TrialBalanceTests = require('./TrialBalance.tests');
const JournalSearchTests = require('./SearchModal.tests');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Posting Journal', () => {
  const path = '/#!/journal';

  test.beforeEach(async () => {
    await TU.navigate(path);
  });

  test.describe('Configuration Modal Tests', JournalConfigurationTests);

  test.describe('Search Tests', JournalSearchTests);

  test.describe('Trial Balance Tests', TrialBalanceTests);
});
