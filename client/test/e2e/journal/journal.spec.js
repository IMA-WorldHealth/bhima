/* jshint expr:true */
/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const helpers = require('../shared/helpers');
helpers.configure(chai);

const JournalCorePage = require('./journal.page.js');
const GridObjectTest = require('../shared/gridObjectTestUtils.spec.js');


describe('Posting Journal Core', function () {
  'use strict';

  const path = '#/journal';
  const initialTransactionRows = 1;

  // this will be run before every single test ('it') - navigating the browser
  // to the correct page.
  before(() => browser.get(path));

  it('displays initial transactions loaded from database', function () {
    var journal = new JournalCorePage();

    // @todo Test updated to test current system, updated with final mock transaction algorithm
    expect(journal.getTotalRows()).to.eventually.be.above(initialTransactionRows);
  });

  it('reset the number of visible columns to default', function (){

    var defaultVisibleColumnNumber = 6;
    var journalPage = new JournalCorePage();

    journalPage.showColumnConfigDialog();
    journalPage.resetColumnConfig();
    journalPage.submitButton();

    expect(journalPage.getColumnCount()).to.eventually.equal(defaultVisibleColumnNumber);

  });

  it('Change a state of a journal grid column', function (){

    var journalPage = new JournalCorePage();
    var visibleColumnsNumberBefore = journalPage.getColumnCount();

    journalPage.showColumnConfigDialog();
    journalPage.changeDescriptionState();
    journalPage.submitButton();

    journalPage.getColumnCount()
    .then(function (visibleColumnsNumberAfter){
      expect(visibleColumnsNumberBefore).to.eventually.equal(visibleColumnsNumberAfter + 1);
    });
  });  
});
