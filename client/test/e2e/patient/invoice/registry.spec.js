/* jshint expr:true */
/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const helpers = require('../../shared/helpers');
const components  = require('../../shared/components');
const FU = require('../../shared/FormUtils');

helpers.configure(chai);

const FU = require('../../shared/FormUtils');
const InvoiceRegistryPage = require('./registry.page.js');
const Search = require('./registry.search.js');

describe('Invoice Registry', () => {
  'use strict';

  const path = '#/invoices';

  // This will be run before every single test ('it') - navigating the browser to the correct page.
  before(() => helpers.navigate(path));

<<<<<<< 2c3db2b2e212866a1e4d0c123a2a3af8d4a00b1b
  const page = new InvoiceRegistryPage();
  const numInvoices = 4;
=======
  it('Credit Note for reverse any transaction in the posting_journal', () => {
    element(by.id('TPA1')).click();
    FU.buttons.submit();
    components.notification.hasSuccess();
  });


  it('displays all invoices loaded from database', () => {
    var invoiceRegistry = new InvoiceRegistryPage();
    expect(invoiceRegistry.getInvoiceNumber()).to.eventually.equal(paramResearch.initialBillNumber);
  });


  it('filters invoices of today correctly', () => {
      var invoiceRegistry = new InvoiceRegistryPage();
      var filterModal = new modalPage();

      invoiceRegistry.showFilterDialog();
      filterModal.setRange('today');
      filterModal.submit();
      expect(invoiceRegistry.getInvoiceNumber()).to.eventually.equal(paramResearch.todayBillNumber);
  });

  it('filters invoices of the week correctly', () => {
      var invoiceRegistry = new InvoiceRegistryPage();
      var filterModal = new modalPage();

      invoiceRegistry.showFilterDialog();
      filterModal.setRange('week');
      filterModal.submit();
      expect(invoiceRegistry.getInvoiceNumber()).to.eventually.equal(paramResearch.weekBillNumber);
  });

  it('filters invoices of the month correctly', () => {
      var invoiceRegistry = new InvoiceRegistryPage();
      var filterModal = new modalPage();

      invoiceRegistry.showFilterDialog();
      filterModal.setRange('month');
      filterModal.submit();
      expect(invoiceRegistry.getInvoiceNumber()).to.eventually.equal(paramResearch.monthBillNumber);
  });

  it('filters invoices of the year correctly', () => {
      var invoiceRegistry = new InvoiceRegistryPage();
      var filterModal = new modalPage();

      invoiceRegistry.showFilterDialog();
      filterModal.setRange('year');
      filterModal.submit();
      expect(invoiceRegistry.getInvoiceNumber()).to.eventually.equal(paramResearch.yearBillNumber);
  });

  it('filters invoices by reference correctly', () => {
      var invoiceRegistry = new InvoiceRegistryPage();
      var filterModal = new modalPage();

      invoiceRegistry.showFilterDialog();
      filterModal.setReference(paramResearch.referenceValue);
      filterModal.submit();
      expect(invoiceRegistry.getInvoiceNumber()).to.eventually.equal(1);
  });

  it('filters invoices by service correctly', () => {
      var invoiceRegistry = new InvoiceRegistryPage();
      var filterModal = new modalPage();
>>>>>>> Complete credit note unit

  it('displays all invoices loaded from the database', () => {
    expect(page.getInvoiceNumber()).to.eventually.equal(numInvoices);
  });

  it('shows the proof of the invoice correctly', () => {
    page.showInvoiceProof(0);
    FU.exists(by.css('[data-modal="receipt"]'), true);

    // close the modal
    $('[data-action="close"]').click();
  });

<<<<<<< 2c3db2b2e212866a1e4d0c123a2a3af8d4a00b1b
  describe('Searching', Search);
=======
>>>>>>> Complete credit note unit
});
