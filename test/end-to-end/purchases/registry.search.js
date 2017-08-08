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
    status: 'Confirmed'
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
    const DEFAULT_PATIENTS_FOR_TODAY = 0;
    modal.switchToDefaultFilterTab();
    modal.setPeriod('today');
    modal.submit();

    expectNumberOfGridRows(DEFAULT_PATIENTS_FOR_TODAY);
  });

  // demonstrates that filtering works
  it(`should find one Purchase Order with Reference "${parameters.reference}"`, () => {
    const NUM_MATCHING = 1;
    FU.input('ModalCtrl.params.reference', parameters.reference);
    modal.switchToDefaultFilterTab();
    modal.setPeriod('year');
    FU.modal.submit();

    expectNumberOfGridRows(NUM_MATCHING);
  });

  it(`should find two Purchases Orders authored By "${parameters.author}"`, () => {
    const NUM_MATCHING = 4;
    modal.setUser('Super User');
    
    modal.switchToDefaultFilterTab();
    modal.setPeriod('allTime');    
    FU.modal.submit();

    element.all(by.css('[data-method="edit"]')).get(0).click();
    element.all(by.name('status')).get(0).click();
    FU.modal.submit();

    expectNumberOfGridRows(NUM_MATCHING);
  });


  it(`Change the status of a purchase order and should find two Purchases Orders status By "${parameters.status}"`, function () {
    const NUM_MATCHING = 1;
    element(by.id('is_confirmed')).click();
    modal.switchToDefaultFilterTab();
    modal.setPeriod('allTime');       
    FU.modal.submit();

    expectNumberOfGridRows(NUM_MATCHING);
  });

}

module.exports = PurchaseOrderSearch;
