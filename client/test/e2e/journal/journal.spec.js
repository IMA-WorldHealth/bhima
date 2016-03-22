/* jshint expr:true */
/* global element, by, browser */
var chai = require('chai');
var expect = chai.expect;

var helpers = require('../shared/helpers');
helpers.configure(chai);

var JournalCorePage = require('./journal.page.js');
var GridObjectTest = require('../shared/gridObjectTestUtils.spec.js');

describe('Posting Journal Core', function () { 
  'use strict'; 

  /** @const */
  var route = '#/journal';

  /** @const */
  var initialTransactionRows = 2;
  
  // this will be run before every single test ('it') - navigating the browser 
  // to the correct page.
  beforeEach(function () { 
    browser.get(route);
  });

  it('displays initial transactions loaded from database', function () { 
    var journal = new JournalCorePage();
    
    expect(journal.totalRows()).to.eventually.equal(initialTransactionRows);
  });
});
