'use strict';

const chai = require('chai');
const expect = chai.expect;

const Filters = require('../shared/components/bhFilters');
const SearchModal = require('../shared/search.page');
const components = require('../shared/components');
const FU = require('../shared/FormUtils');

function PurchaseOrderSearch() {
  let modal;
  let filters;

  const parameters = {
    reference: 'PO.TPA.2',
    name1: 'Patient',
    author: 'Super User',
    status: 'Confirmed',
    supplier : 'Test Supplier',
  };

  const grid = element(by.id('purchase-registry'));
  const rows = grid.element(by.css('.ui-grid-render-container-body'))
    .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));  

  beforeEach(() => {
    SearchModal.open();
    modal = new SearchModal('purchase-search');
    filters = new Filters();
  });

  afterEach(() => {
    filters.resetFilters();
  });

  function expectNumberOfGridRows(number) {
    expect(rows.count(),
      `Expected Patient Registry ui-grid's row count to be ${number}.`
    ).to.eventually.equal(number);
  }

  it('grid should have 0 visible rows', () => {
    const DEFAULT_PURCHASES_FOR_TODAY = 0;
    modal.switchToDefaultFilterTab();
    modal.setPeriod('today');
    modal.submit();

    expectNumberOfGridRows(DEFAULT_PURCHASES_FOR_TODAY);
  });

  // demonstrates that filtering works
  it(`should find one Purchase Order with Reference "${parameters.reference}" for the current year`, () => {
    const NUM_MATCHING = 1;
    modal.setReference(parameters.reference);

    modal.switchToDefaultFilterTab();
    modal.setPeriod('year');
    FU.modal.submit();

    expectNumberOfGridRows(NUM_MATCHING);
  });

  it(`should find four Purchases Orders authored By "${parameters.author}" for all time`, () => {
    const NUM_MATCHING = 4;
    modal.setUser(parameters.author);
    
    modal.switchToDefaultFilterTab();
    modal.setPeriod('allTime');    
    FU.modal.submit();

    expectNumberOfGridRows(NUM_MATCHING);
  });

  it(`should list all purchase orders ordered to "${parameters.supplier}" for all time`, () => {
    const NUM_MATCHING = 4;
    modal.setSupplier(parameters.supplier);
    
    modal.switchToDefaultFilterTab();
    modal.setPeriod('allTime');    
    FU.modal.submit();

    expectNumberOfGridRows(NUM_MATCHING);
  });


  it(`Choose the status confirmed and should find two Purchases Orders status By "${parameters.status}" for all time`, function () {
    const NUM_MATCHING = 4;
    element(by.id('is_confirmed')).click();
    modal.switchToDefaultFilterTab();
    modal.setPeriod('allTime');       
    FU.modal.submit();

    expectNumberOfGridRows(NUM_MATCHING);
  });

}

module.exports = PurchaseOrderSearch;
