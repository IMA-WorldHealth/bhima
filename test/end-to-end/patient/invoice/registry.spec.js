/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const helpers = require('../../shared/helpers');
const components  = require('../../shared/components');
helpers.configure(chai);

const FU = require('../../shared/FormUtils');
const InvoiceRegistryPage = require('./registry.page.js');
const Search = require('./registry.search.js');

describe('Invoice Registry', () => {
  'use strict';

  const path = '#/invoices';
  const page = new InvoiceRegistryPage();
  const numInvoices = 5;

  // This will be run before every single test ('it') - navigating the browser to the correct page.
  before(() => helpers.navigate(path));

  it('displays all invoices loaded from the database', () => {
    showAllTransactions();
    expect(page.getInvoiceNumber()).to.eventually.equal(numInvoices);
  });

  it('shows the proof of the invoice correctly', () => {
    page.clickOnMethod(0, 'invoiceReceipt');
    FU.exists(by.css('[data-modal="receipt"]'), true);
    FU.modal.close();
  });

  describe('Search', Search);

  it('Credit Note for reverse any transaction in the posting_journal', () => {
    showAllTransactions();

    // element(by.id("IV.TPA.3")).click();
    page.clickOnMethod(0, 'createCreditNote');
    FU.input('ModalCtrl.creditNote.description', 'Credit Note Error');
    FU.modal.submit();
    components.notification.hasSuccess();
  });

  it('shows the proof of the credit note correctly', () => {
    page.clickOnMethod(0, 'creditNoteReceipt');
    FU.modal.close();
  });

  function showAllTransactions() {
    // @FIXME patch for restricting invoices
    // set up the page to show all invoices
    FU.buttons.search();
    $('[data-date-range="day"]').click();
    components.dateInterval.dateFrom('01/01/2015');
    FU.modal.submit();

  }

});
