/* global element, by, browser */

const chai = require('chai');
const expect = chai.expect;

const helpers = require('../shared/helpers');
helpers.configure(chai);

const JournalCorePage = require('./journal.page.js');
const FU = require('../shared/FormUtils');

function JournalConfigurationModal() {
  'use strict';

  const defaultVisibleColumnCount = 10;
  const modifiedVisibleColumnCount = 3;
  const page = new JournalCorePage();

  it(`displays ${defaultVisibleColumnCount} visible columns by default`, () => {
    // tests expect page to be in transaction mode
    $('[data-method="grouping"]').click();

    page.expectColumnCount(defaultVisibleColumnCount);
  });

  it('removes all but the debit and credit columns', () => {
    page.openGridConfigurationModal();

    page.setColumnCheckboxes(['debit_equiv', 'credit_equiv']);

    FU.modal.submit();

    page.expectHeaderColumns(['Debit', 'Credit', '']);
  });

  it('remembers cached columns on browser refresh', () => {
    browser.refresh();
    page.expectColumnCount(modifiedVisibleColumnCount);
  });

  // it.skip('resets the columns to the defaults', () => {
  //   page.openGridConfigurationModal();

  //   page.setDefaultColumnCheckboxes();

  //   FU.modal.submit();

  //   // sleep for a second to let angular adjust the grid's columns
  //   browser.sleep(1000);

  //   page.expectColumnCount(defaultVisibleColumnCount);
  // });
}

module.exports = JournalConfigurationModal;
