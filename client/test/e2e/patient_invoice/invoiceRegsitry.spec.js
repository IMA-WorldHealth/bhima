/* jshint expr:true */
/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const helpers = require('../shared/helpers');
helpers.configure(chai);

const InvoiceRegistryPage = require('./invoiceRegistry.page.js');
const modalPage = require('./modal.page.js');
const ReceiptModalPage = require('../receipt_modal/receiptModal.page.js');

describe('Invoice Registry page', function () {
  'use strict';

    const path = '#/invoices';

    var paramResearch = {
        initialBillNumber : 2,
        todayBillNumber : 0,
        weekBillNumber : 0,
        monthBillNumber : 0,
        yearBillNumber : 2,
        referenceValue : 'TPA2',
        serviceValue : 'Test Service',
        userValue : 'Super User',
        distributableInvoiceNumber : 2,
        noDistributableInvoiceNumber : 0
    };

  // This will be run before every single test ('it') - navigating the browser to the correct page.
  before(() => helpers.navigate(path));

  it('displays all invoices loaded from database', function () {
    var invoiceRegistry = new InvoiceRegistryPage();
    expect(invoiceRegistry.getInvoiceNumber()).to.eventually.be.equal(paramResearch.initialBillNumber);
  });

    it('filters invoices of today correctly', function () {
        var invoiceRegistry = new InvoiceRegistryPage();
        var filterModal = new modalPage();

        invoiceRegistry.showFilterDialog();
        filterModal.setRange('today');
        filterModal.submit();
        expect(invoiceRegistry.getInvoiceNumber()).to.eventually.be.equal(paramResearch.todayBillNumber);
    });

    it('filters invoices of the week correctly', function () {
        var invoiceRegistry = new InvoiceRegistryPage();
        var filterModal = new modalPage();

        invoiceRegistry.showFilterDialog();
        filterModal.setRange('week');
        filterModal.submit();
        expect(invoiceRegistry.getInvoiceNumber()).to.eventually.be.equal(paramResearch.weekBillNumber);
    });

    it('filters invoices of the month correctly', function () {
        var invoiceRegistry = new InvoiceRegistryPage();
        var filterModal = new modalPage();

        invoiceRegistry.showFilterDialog();
        filterModal.setRange('month');
        filterModal.submit();
        expect(invoiceRegistry.getInvoiceNumber()).to.eventually.be.equal(paramResearch.monthBillNumber);
    });

    it('filters invoices of the year correctly', function () {
        var invoiceRegistry = new InvoiceRegistryPage();
        var filterModal = new modalPage();

        invoiceRegistry.showFilterDialog();
        filterModal.setRange('year');
        filterModal.submit();
        expect(invoiceRegistry.getInvoiceNumber()).to.eventually.be.equal(paramResearch.yearBillNumber);
    });

    it('filters invoices by reference correctly', function () {
        var invoiceRegistry = new InvoiceRegistryPage();
        var filterModal = new modalPage();

        invoiceRegistry.showFilterDialog();
        filterModal.setReference(paramResearch.referenceValue);
        filterModal.submit();
        expect(invoiceRegistry.getInvoiceNumber()).to.eventually.be.equal(1);
    });

    it('filters invoices by service correctly', function () {
        var invoiceRegistry = new InvoiceRegistryPage();
        var filterModal = new modalPage();

        invoiceRegistry.showFilterDialog();
        filterModal.setServiceChoice(paramResearch.serviceValue);
        filterModal.submit();
        expect(invoiceRegistry.getInvoiceNumber()).to.eventually.be.equal(paramResearch.initialBillNumber);
    });

    it('filters invoices by user correctly', function () {
        var invoiceRegistry = new InvoiceRegistryPage();
        var filterModal = new modalPage();

        invoiceRegistry.showFilterDialog();
        filterModal.setUserChoice(paramResearch.userValue);
        filterModal.submit();
        expect(invoiceRegistry.getInvoiceNumber()).to.eventually.be.equal(paramResearch.initialBillNumber);
    });

    it('filters distributable invoice only correctly', function () {
        var invoiceRegistry = new InvoiceRegistryPage();
        var filterModal = new modalPage();

        invoiceRegistry.showFilterDialog();
        filterModal.chooseDistributableOnly()
        filterModal.submit();
        expect(invoiceRegistry.getInvoiceNumber()).to.eventually.be.equal(paramResearch.distributableInvoiceNumber);
    });

    it('filters no distributable only correctly', function () {
        var invoiceRegistry = new InvoiceRegistryPage();
        var filterModal = new modalPage();

        invoiceRegistry.showFilterDialog();
        filterModal.chooseNoDistributableOnly();
        filterModal.submit();
        expect(invoiceRegistry.getInvoiceNumber()).to.eventually.be.equal(paramResearch.noDistributableInvoiceNumber);
    });

    it('filters distributable or not invoice correctly', function () {
        var invoiceRegistry = new InvoiceRegistryPage();
        var filterModal = new modalPage();

        invoiceRegistry.showFilterDialog();
        filterModal.chooseNoYesDistributable();
        filterModal.submit();
        expect(invoiceRegistry.getInvoiceNumber()).to.eventually.be.equal(paramResearch.initialBillNumber);
    });

    it('filters by providing all parameters correctly', function () {
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
        expect(invoiceRegistry.getInvoiceNumber()).to.eventually.be.equal(1);
    });

    it('shows the proof of the invoice correctly', function () {
        var invoiceRegistry = new InvoiceRegistryPage();
        var invoiceProof = new ReceiptModalPage();

        invoiceRegistry.showInvoiceProof(0);
        expect(invoiceRegistry.isInvoiceProofPresent()).to.eventually.equal(true);
        invoiceProof.close();
    });
});
