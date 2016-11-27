/* jshint expr:true */
/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const helpers = require('../../shared/helpers');
helpers.configure(chai);

const FU = require('../../shared/FormUtils');

const InvoiceRegistryPage = require('./registry.page.js');

function InvoiceRegistrySearch() {
  'use strict';

  const params = {
    monthBillNumber : 0,
    referenceValue : 'TPA2',
    serviceValue : 'Test Service',
    userValue : 'Super User'
  };

  const page = new InvoiceRegistryPage();

  function expectNumberOfGridRows(number) {
    expect(page.getInvoiceNumber(),
      `Expected Invoice Registry's ui-grid row count to be ${number}.`
    ).to.eventually.equal(number);
  }

  function expectNumberOfFilters(number) {
    const filters = $('[data-bh-filter-bar]').all(by.css('.label'));
    expect(filters.count(),
      `Expected Invoice Registry bh-filter-bar's filter count to be ${number}.`
    ).to.eventually.equal(number);
  }

  it('filters invoices by clicking on date buttons', () => {

    // set the filters to month
    FU.buttons.search();
    $('[data-date-range="month"]').click();
    FU.modal.submit();

    expectNumberOfGridRows(params.monthBillNumber);
    expectNumberOfFilters(2);

    // make sure to clear the filters for the next test
    FU.buttons.clear();
  });

  it('filters invoices by manually setting the date', () => {

    // set the date inputs manually
    FU.buttons.search();
    FU.input('ModalCtrl.params.billingDateTo', '2015-01-30');
    FU.modal.submit();

    expectNumberOfGridRows(0);
    expectNumberOfFilters(1);

    // make sure to clear the filters for the next test
    FU.buttons.clear();
  });

  it('filters by reference should return a single result', () => {
    FU.buttons.search();
    FU.input('ModalCtrl.params.reference', 'TPA2');
    FU.modal.submit();

    expectNumberOfGridRows(1);
    expectNumberOfFilters(1);

    // make sure to clear the filters for the next test
    FU.buttons.clear();
  });

  it('filters by <select> should return two results', () => {
    FU.buttons.search();
    FU.select('ModalCtrl.params.service_id', 'Test Service');
    FU.select('ModalCtrl.params.user_id', 'Super User');
    FU.modal.submit();

    expectNumberOfGridRows(2);
    expectNumberOfFilters(2);

    // make sure to clear the filters for the next test
    FU.buttons.clear();
  });

}

module.exports = InvoiceRegistrySearch;
