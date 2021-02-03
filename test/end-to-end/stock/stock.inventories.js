/* global element, by */
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');
const SearchModal = require('../shared/search.page');
const Filters = require('../shared/components/bhFilters');

function StockInventoriesRegistryTests() {
  let modal;
  let filters;

  // navigate to the page
  before(() => helpers.navigate('#/stock/inventories'));

  beforeEach(async () => {
    await SearchModal.open();
    modal = new SearchModal('stock-inventories-search');
    filters = new Filters();
  });

  const gridId = 'stock-inventory-grid';

  const depotGroupingRow = 1;

  it('find 2 inventory in Depot Secondaire plus one line for the Grouping', async () => {
    await modal.setDepot('Depot Secondaire');
    await modal.submit();
    await GU.expectRowCount(gridId, 2 + depotGroupingRow);
  });

  it('find 5 inventory in Depot Principal plus one line for the Grouping', async () => {
    await modal.setDepot('Depot Principal');
    await modal.submit();
    await GU.expectRowCount(gridId, 5 + depotGroupingRow);
    await filters.resetFilters();
  });

  it('find inventory by name', async () => {
    await modal.setInventory('Quinine');
    await modal.submit();
    await GU.expectRowCount(gridId, 2);
    await filters.resetFilters();
  });

  it('find 0 inventory by state stock out', async () => {
    await FU.radio('$ctrl.searchQueries.status', 0);
    await FU.modal.submit();
    await GU.expectRowCount(gridId, 0);
    await filters.resetFilters();
  });

  it('find 0 inventory by state in stock', async () => {
    await FU.radio('$ctrl.searchQueries.status', 1);
    await FU.modal.submit();
    await GU.expectRowCount(gridId, 0);

    await filters.resetFilters();
  });

  it('find 2 inventory by state (security reached)', async () => {
    await FU.radio('$ctrl.searchQueries.status', 2);
    await FU.modal.submit();
    await GU.expectRowCount(gridId, 2);

    await filters.resetFilters();
  });

  it('find 0 inventories by state for grouping (minimum reached)', async () => {
    await FU.radio('$ctrl.searchQueries.status', 3);
    await FU.modal.submit();

    await GU.expectRowCount(gridId, 0);
    await filters.resetFilters();
  });

  it('find 6 inventories by state (over maximum)', async () => {
    await FU.radio('$ctrl.searchQueries.status', 4);
    await FU.modal.submit();

    await GU.expectRowCount(gridId, 8);
    await filters.resetFilters();
  });

  it('find 9 inventories for all time ', async () => {
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('allTime');
    await modal.submit();
    await GU.expectRowCount(gridId, 9);
    await filters.resetFilters();
  });

  it('find 1 inventories who requires a purchase order plus one line of grouping', async () => {
    await element(by.model('$ctrl.searchQueries.require_po')).click();
    await FU.modal.submit();
    await GU.expectRowCount(gridId, 2);
    await filters.resetFilters();
  });
}

module.exports = StockInventoriesRegistryTests;
