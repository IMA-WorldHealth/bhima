const helpers = require('../shared/helpers');
const AccountStatementCorePage = require('./account_statement.page.js');

describe('Account Statement Core', () => {
  const path = '#!/account_statement';
  const AccountStatement = new AccountStatementCorePage();

  // this will be run before every single test ('it') - navigating the browser
  // to the correct page.
  before(() => helpers.navigate(path));

  const sample = {
    account : '41111000',
    comment : 'custom',
  };

  it(`search the account ${sample.account} `, async () => {
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

  // TODO(@jniles) - make this test work correctly
  // skip throw error : Test `title` should be a "string" but "function" was given instead.
  it.skip(`comment the rows for account ${sample.account} with ${sample.comment}`, async () => {
    // select the first row
    await AccountStatement.selectRow(0);

    // comment the first row with `custom`
    await AccountStatement.comment(sample.comment);

    // check if we have `custom` as comment in the first row
    await AccountStatement.cellValueMatch(0, 8, sample.comment);
  });
});
