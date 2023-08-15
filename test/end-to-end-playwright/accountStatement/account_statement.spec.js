const { chromium } = require('@playwright/test');
const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const AccountStatementCorePage = require('./account_statement.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Account Statement Core', () => {
  const path = '/#!/account_statement';
  const AccountStatement = new AccountStatementCorePage();

  // this will be run before every single test - navigating the browser
  // to the correct page.
  test.beforeEach(async () => {
    await TU.navigate(path);
  });

  const sample = {
    account : '41111000',
    comment : 'custom',
  };

  test('Set the period to allTime', async () => {
    await AccountStatement.setPeriod('allTime');
  });

  // @TODO: Fix.  Works alone but fails with other tests
  test.skip('Verify account grid operations (also tests GridUtils)', async () => {
    await AccountStatement.setPeriod('allTime');

    // Verify that we can retrieve the value from a cell in the account grid
    await AccountStatement.cellValueMatch(2, 3, '66110011');

    // Verify the grid size
    await AccountStatement.expectRowCount(12, 'should have 12 accounts');
    await AccountStatement.expectColumnCount(10, 'accounts should have 10 columns');

    // Check the name for one of the columns
    const colHeaders = await AccountStatement.getColumnHeaders();
    const colTitle = await colHeaders[3].innerText();
    expect(colTitle.trim()).toBe('Account');
  });

  test(`comment the rows for account ${sample.account} with ${sample.comment}`, async () => {
    await AccountStatement.setPeriod('allTime');

    // select the first row
    await AccountStatement.selectRow(1);

    // comment the first row with `custom`
    await AccountStatement.comment(sample.comment);

    // check if we have `custom` as comment in the first row
    await AccountStatement.cellValueMatch(1, 9, sample.comment);
  });

  test(`search the account ${sample.account} `, async () => {
    // open search and tabulate to default section
    await AccountStatement.openSearchModal();
    await AccountStatement.tabulate(1);

    // set the default account
    await AccountStatement.setAccount(sample.account);

    // submit
    await AccountStatement.formModalSubmit();

    // expected value
    await AccountStatement.expectRowCount(0);
  });

});
