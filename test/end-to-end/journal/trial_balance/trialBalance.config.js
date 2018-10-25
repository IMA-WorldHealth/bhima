/* global browser */

const { expect } = require('chai');

const JournalCorePage = require('../journal.page.js');
const TrialBalancePage = require('./trialBalance.page.js');

function TrialBalanceTest() {
  const journal = new JournalCorePage();
  const trialBalance = new TrialBalancePage();

  it('it should consider that the related transaction is selected even if you selected just one row', () => {
    journal.checkRow(2);
    journal.openTrialBalanceModal();
    expect(trialBalance.getLineCount()).to.eventually.equal(2);
    trialBalance.closeTrialBalance();
  });

  it('it should post a transaction with success', () => {
    browser.refresh(); // just to uncheck the line selected previously
    journal.checkRow(6);

    journal.openTrialBalanceModal();
    trialBalance.submitData();
  });
}

module.exports = TrialBalanceTest;
