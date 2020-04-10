/* global element, by */

const { expect } = require('chai');

const Filters = require('../shared/components/bhFilters');
const SearchModal = require('../shared/search.page');
const components = require('../shared/components');
const FU = require('../shared/FormUtils');

function PurchaseOrderSearch() {
  let modal;
  let filters;

  const parameters = {
    reference : 'PO.TPA.2',
    name1 : 'Patient',
    author : 'Super User',
    inventory : 'Quinine Bichlorhydrate, sirop, 100mg base',
    status : ['Confirmé'],
    supplier : 'SNEL',
  };

  const grid = element(by.id('purchase-registry'));
  const rows = grid.element(by.css('.ui-grid-render-container-body'))
    .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));

  beforeEach(async () => {
    await SearchModal.open();
    modal = new SearchModal('purchase-search');
    filters = new Filters();
  });

  afterEach(async () => {
    await filters.resetFilters();
  });

  async function expectNumberOfGridRows(number) {
    expect(await rows.count(),
      `Expected Patient Registry ui-grid's row count to be ${number}.`).to.equal(number);
  }

  it('grid should have 0 visible rows', async () => {
    const DEFAULT_PURCHASES_FOR_TODAY = 0;
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('today');
    await modal.submit();

    await expectNumberOfGridRows(DEFAULT_PURCHASES_FOR_TODAY);
  });

  // demonstrates that filtering works
  it(`should find one Purchase Order with Reference "${parameters.reference}" for all time`, async () => {
    const NUM_MATCHING = 1;
    await modal.setReference(parameters.reference);

    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('allTime');
    await FU.modal.submit();

    await expectNumberOfGridRows(NUM_MATCHING);
  });

  it(`should find four Purchases Orders authored By "${parameters.author}" for all time`, async () => {
    const NUM_MATCHING = 4;
    await modal.setUser(parameters.author);

    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('allTime');
    await FU.modal.submit();

    await expectNumberOfGridRows(NUM_MATCHING);
  });

  it(`should list all purchase orders ordered to "${parameters.supplier}" for all time`, async () => {
    const NUM_MATCHING = 4;
    await modal.setSupplier(parameters.supplier);

    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('allTime');
    await FU.modal.submit();

    await expectNumberOfGridRows(NUM_MATCHING);
  });

  it(`should list all purchase orders with "${parameters.inventory}" for all time`, async () => {
    const NUM_MATCHING = 2;
    await modal.setInventory(parameters.inventory);

    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('allTime');
    await FU.modal.submit();

    await expectNumberOfGridRows(NUM_MATCHING);
  });


  it(`choose the status confirmed and should find two purchases orders status by "${parameters.status}" for all time`,
    async () => {
      const NUM_MATCHING = 1;
      await components.purchaseStatusSelect.set(parameters.status);
      await modal.switchToDefaultFilterTab();
      await modal.setPeriod('allTime');
      await FU.modal.submit();

      await expectNumberOfGridRows(NUM_MATCHING);
    });
}

module.exports = PurchaseOrderSearch;
