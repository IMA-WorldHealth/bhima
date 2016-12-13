/* global element, by, browser */

const chai = require('chai');
const expect = chai.expect;
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const JournalCorePage = require('../journal.page.js');
const TrialBalancePage = require('./trialBalance.page.js');
const TrialBalanceDetailPage = require('./trialBalanceDetail.page');
const TrialBalanceErrorPage = require('./errorView.page');
const GeneralLedgerPage = require('../../general_ledger/generalLedger.page.js');

function TrialBalanceTest() {

  const journal = new JournalCorePage();
  const trialBalance = new TrialBalancePage();
  const generalLedger = new GeneralLedgerPage();
  const trialBalanceError = new TrialBalanceErrorPage();
  const trialBalanceDetail = new TrialBalanceDetailPage();

  it('it should consider that the related transaction is selected even if you selected just one row', function () {
    journal.checkRow(2);
    journal.openTrialBalanceModal();
    expect(trialBalance.getLineCount()).to.eventually.at.least(1);
    expect(trialBalance.getLineCount()).to.eventually.below(3);
    trialBalance.closeTrialBalance();
  });

  it('it should switch the view successfully', function () {
    journal.checkRow(0);
    journal.openTrialBalanceModal();

    expect(trialBalance.getLineCount()).to.eventually.equal(2);
    trialBalance.switchView(); //from group by account to transaction

    expect(trialBalance.getLineCount()).to.eventually.equal(3);
    trialBalance.switchView(); //from group by transaction to account

    expect(trialBalance.getLineCount()).to.eventually.equal(2);
    trialBalance.viewErrorList(); //will print error grid

    expect(trialBalanceError.getLineCount()).to.eventually.equal(2);
    trialBalanceError.reset(); //back to the group by account view
    expect(trialBalance.getLineCount()).to.eventually.equal(2);

    trialBalance.showAccountDetailInTransaction(0); //will print list of transaction relative to selected account line(index 0 in occurrence)
    expect(trialBalanceDetail.getLineCount()).to.eventually.equal(3);
    trialBalanceDetail.reset();
    trialBalance.closeTrialBalance();
  });

  it('it should print a transaction', function () {
    browser.refresh(); //Fix me, How to check the report in PDF
    journal.checkRow(6);
    element(by.id('print')).click();
  });

  it('it should post a transaction with success', function () {
    browser.refresh(); //just to uncheck the line selected previously
    journal.checkRow(6);
    journal.openTrialBalanceModal();
    trialBalance.submitData();
    expect(generalLedger.getLineCount()).to.eventually.equal(3);
  });
}

module.exports = TrialBalanceTest;
