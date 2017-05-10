'use strict';

/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const helpers = require('../../shared/helpers');
helpers.configure(chai);

const FU = require('../../shared/FormUtils');
const components = require('../../shared/components');

const InvoiceRegistryPage = require('./registry.page.js');

function InvoiceRegistrySearch() {

  const NUM_INVOICES = 5;

  const params = {
    monthBillNumber : 0,
    referenceValue : 'IV.TPA.2',
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
    components.dateInterval.dateTo('30/01/2015');
    FU.modal.submit();

    expectNumberOfGridRows(0);
    expectNumberOfFilters(1);

    // make sure to clear the filters for the next test
    FU.buttons.clear();
  });

  it('filters by reference should return a single result', () => {
    FU.buttons.search();
    FU.input('ModalCtrl.params.reference', 'IV.TPA.2');
    FU.modal.submit();

    expectNumberOfGridRows(1);
    expectNumberOfFilters(1);

    // make sure to clear the filters for the next test
    FU.buttons.clear();
  });

  it('filters by reference of patient should get no result', () => {
    FU.buttons.search();
    FU.input('ModalCtrl.params.patientReference', 'PA.TPA.3');
    FU.modal.submit();

    expectNumberOfGridRows(0);
    expectNumberOfFilters(1);

    // make sure to clear the filters for the next test
    FU.buttons.clear();
  });

  it('filters by reference of patient should get some result', () => {
    FU.buttons.search();
    FU.input('ModalCtrl.params.patientReference', 'PA.TPA.1');
    FU.modal.submit();

    expectNumberOfGridRows(3);
    expectNumberOfFilters(1);

    // make sure to clear the filters for the next test
    FU.buttons.clear();
  });

  it('filters by <select> should return three results', () => {
    FU.buttons.search();
    FU.select('ModalCtrl.params.service_id', 'Administration');
    components.userSelect.set('Super User');
    FU.modal.submit();

    expectNumberOfGridRows(3);
    expectNumberOfFilters(2);

    // make sure to clear the filters for the next test
    FU.buttons.clear();
  });

  // it.skip('clear filters should remove all filters on the registry', () => {
  //   FU.buttons.search();
  //   FU.input('ModalCtrl.params.reference', 'IV.TPA.1');
  //   FU.modal.submit();

  //   expectNumberOfGridRows(1);
  //   expectNumberOfFilters(1);

  //   FU.buttons.clear();

  //   expectNumberOfGridRows(NUM_INVOICES);
  //   expectNumberOfFilters(0);
  // });
}

module.exports = InvoiceRegistrySearch;
