/* jshint expr:true */
/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const helpers = require('../../shared/helpers');
helpers.configure(chai);

const InvoiceRegistryPage = require('./registry.page.js');
const modalPage = require('./modal.page.js');
const ReceiptModalPage = require('../../receipt_modal/receiptModal.page.js');

describe('Invoice Registry', () => {
  'use strict';

  const path = '#/invoices';

  const paramResearch = {
    initialBillNumber : 4,
    todayBillNumber : 0,
    weekBillNumber : 0,
    monthBillNumber : 0,
    yearBillNumber : 4,
    referenceValue : 'TPA2',
    serviceValue : 'Test Service',
    userValue : 'Super User',
    distributableInvoiceNumber : 4,
    noDistributableInvoiceNumber : 0
  };

  // This will be run before every single test ('it') - navigating the browser to the correct page.
  before(() => helpers.navigate(path));

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

      invoiceRegistry.showFilterDialog();
      filterModal.setServiceChoice(paramResearch.serviceValue);
      filterModal.submit();
      expect(invoiceRegistry.getInvoiceNumber()).to.eventually.equal(paramResearch.initialBillNumber);
  });

  it('filters invoices by user correctly', () => {
      var invoiceRegistry = new InvoiceRegistryPage();
      var filterModal = new modalPage();

      invoiceRegistry.showFilterDialog();
      filterModal.setUserChoice(paramResearch.userValue);
      filterModal.submit();
      expect(invoiceRegistry.getInvoiceNumber()).to.eventually.equal(paramResearch.initialBillNumber);
  });

  it('filters distributable invoice only correctly', () => {
      var invoiceRegistry = new InvoiceRegistryPage();
      var filterModal = new modalPage();

      invoiceRegistry.showFilterDialog();
      filterModal.chooseDistributableOnly();
      filterModal.submit();
      expect(invoiceRegistry.getInvoiceNumber()).to.eventually.equal(paramResearch.distributableInvoiceNumber);
  });

  it('filters no distributable only correctly', () => {
      var invoiceRegistry = new InvoiceRegistryPage();
      var filterModal = new modalPage();

      invoiceRegistry.showFilterDialog();
      filterModal.chooseNoDistributableOnly();
      filterModal.submit();
      expect(invoiceRegistry.getInvoiceNumber()).to.eventually.equal(paramResearch.noDistributableInvoiceNumber);
  });

  it('filters distributable or not invoice correctly', () => {
      var invoiceRegistry = new InvoiceRegistryPage();
      var filterModal = new modalPage();

      invoiceRegistry.showFilterDialog();
      filterModal.chooseNoYesDistributable();
      filterModal.submit();
      expect(invoiceRegistry.getInvoiceNumber()).to.eventually.equal(paramResearch.initialBillNumber);
  });

  it('filters by providing all parameters correctly', () => {
      var invoiceRegistry = new InvoiceRegistryPage();
      var filterModal = new modalPage();

      invoiceRegistry.showFilterDialog();
      filterModal.setRange('year');
      filterModal.setReference(paramResearch.referenceValue);
      filterModal.setServiceChoice(paramResearch.serviceValue);
      filterModal.setUserChoice(paramResearch.userValue);
      filterModal.chooseNoDistributableOnly();
      filterModal.chooseNoYesDistributable();
      filterModal.submit();
      expect(invoiceRegistry.getInvoiceNumber()).to.eventually.equal(1);
  });

  it('shows the proof of the invoice correctly', () => {
      var invoiceRegistry = new InvoiceRegistryPage();
      var invoiceProof = new ReceiptModalPage();

      invoiceRegistry.showInvoiceProof(0);
      expect(invoiceRegistry.isInvoiceProofPresent()).to.eventually.equal(true);
      invoiceProof.close();
  });
});
