/* global element, by, browser */

const chai = require('chai');
const expect = chai.expect;
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const JournalCorePage = require('../journal.page.js');
const TrialBalancePage = require('./trialBalance.page.js');
const GeneralLedgerPage = require('../../general_ledger/generalLedger.page.js');

function TrialBalanceTest(){
  'use strict';

  const journal = new JournalCorePage();
  const trialBalance = new TrialBalancePage();
  const generalLedger = new GeneralLedgerPage();
  const path = '#/journal';

  // This will be run before every single test ('it') - navigating the browser to the correct page.
  beforeEach(() => helpers.navigate(path));

  it('it should post a transaction with success', function () {
    journal.checkRow(6);
    journal.openTrialBalanceModal();
    trialBalance.submitData();
    expect(generalLedger.getLineCount()).to.eventually.equal(3);
  });

  it('it should consider that the related transaction is selected even if you selected just one row', function () {
    journal.checkRow(1);
    journal.openTrialBalanceModal();
    expect(trialBalance.getLineCount()).to.eventually.equal(2);
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
    expect(trialBalance.getLineCount()).to.eventually.equal(2);
    trialBalance.resetView(); //back to the group by account view
    expect(trialBalance.getLineCount()).to.eventually.equal(2);
    trialBalance.showAccountDetailInTransaction(1); //will print list of transaction relative to selected account line(index 0 in occurrence)
    expect(trialBalance.getLineCount()).to.eventually.equal(3);
    trialBalance.resetView();
    trialBalance.closeTrialBalance();
  });

  it('it should remember the last main view visited', function () {
    journal.checkRow(1);
    journal.openTrialBalanceModal();
    expect(trialBalance.getLineCount()).to.eventually.equal(2);
    trialBalance.switchView(); //list data by transaction
    expect(trialBalance.getLineCount()).to.eventually.equal(3);
    trialBalance.viewErrorList();
    trialBalance.resetView();
    expect(trialBalance.getLineCount()).to.eventually.equal(3); //make sure we go back to the transaction view
    trialBalance.closeTrialBalance();
  });
}

module.exports = TrialBalanceTest;
