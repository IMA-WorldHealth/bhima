/* global element, by, browser */

const chai = require('chai');
const expect = chai.expect;

const helpers = require('../shared/helpers');
helpers.configure(chai);

const JournalCorePage = require('./journal.page.js');
const FU = require('../shared/FormUtils');

function JournalConfigurationModal() {
  'use strict';

  const defaultVisibleColumnCount = 6;
  const modifiedVisibleColumnCount = 2;
  const page = new JournalCorePage();

  it('displays six visible columns by default', () => {
    page.expectColumnCount(defaultVisibleColumnCount);
  });

  it('removes all but the debit and credit columns', () => {
    page.openGridConfigurationModal();

    page.setColumnCheckboxes(['debit_equiv', 'credit_equiv']);

    FU.modal.submit();

    page.expectHeaderColumns(['Debit', 'Credit']);
  });

  it('remembers cached columns on browser refresh', () => {
    browser.refresh();
    page.expectColumnCount(modifiedVisibleColumnCount);
  });

  it('resets the columns to the defaults', () => {
    page.openGridConfigurationModal();

    page.setDefaultColumnCheckboxes();

    FU.modal.submit();

    page.expectColumnCount(defaultVisibleColumnCount);
  });
}

module.exports = JournalConfigurationModal;
