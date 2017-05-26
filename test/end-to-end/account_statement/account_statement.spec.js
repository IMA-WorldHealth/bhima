/* global element, by, browser */

const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

const AccountStatementCorePage = require('./account_statement.page.js');

describe('Account Statement Core', () => {
  const path = '#!/account_statement';
  const AccountStatement = new AccountStatementCorePage();

  // this will be run before every single test ('it') - navigating the browser
  // to the correct page.
  before(() => helpers.navigate(path));

  const sample = {
    account : 67003,
    comment : 'custom',
  };

  it(`search the account ${sample.account} `, () => {
    // open search and tabulate to default section
    AccountStatement.openSearchModal();
    AccountStatement.tabulate(1);

    // set the default account
    AccountStatement.setAccount(sample.account);

    // submit
    AccountStatement.formModalSubmit();

    // expected value
    AccountStatement.expectRowCount(1);
  });

  it(`comment the rows for account ${sample.account} with ${sample.comment}`, () => {
    // select the first row
    AccountStatement.selectRow(0);

    // comment the first row with `custom`
    AccountStatement.comment(sample.comment);

    // check if we have `custom` as comment in the first row
    AccountStatement.cellValueMatch(0, 8, sample.comment);
  });
});
