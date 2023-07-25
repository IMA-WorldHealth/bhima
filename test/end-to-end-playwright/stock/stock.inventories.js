const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

const GU = require('../shared/GridUtils');
const SearchModal = require('../shared/search.page');
const Filters = require('../shared/components/bhFilters');

// FIXME(@jniles) - all these tests find 0 for their stock
// flags.

function StockInventoriesRegistryTests() {
  const path = '/#/stock/inventories';
  let modal;
  let filters;

  // navigate to the page
  test.beforeEach(async () => {
    await TU.navigate(path);
    modal = new SearchModal('stock-inventories-search', path);
    await modal.open();
    filters = new Filters();
  });

  const gridId = 'stock-inventory-grid';

  const depotGroupingRow = 1;

  test('find 2 inventory in Depot Secondaire plus one line for the Grouping', async () => {
    await modal.setDepot('Depot Secondaire');
    await modal.submit();
    await GU.expectRowCount(gridId, 2 + depotGroupingRow);
  });

  // test('find 5 inventory in Depot Principal plus one line for the Grouping', async () => {
  //   await modal.setDepot('Depot Principal');
  //   await modal.submit();
  //   await GU.expectRowCount(gridId, 5 + depotGroupingRow);
  //   await filters.resetFilters();
  // });

  // test('find inventory by name', async () => {
  //   await modal.setInventory('Quinine');
  //   await modal.submit();
  //   await GU.expectRowCount(gridId, 2);
  //   await filters.resetFilters();
  // });

  // test('find 0 inventory by state stock out', async () => {
  //   await TU.radio('$ctrl.searchQueries.status', 0);
  //   await TU.modal.submit();
  //   await GU.expectRowCount(gridId, 0);
  //   await filters.resetFilters();
  // });

  // test('find 0 inventory by state in stock', async () => {
  //   await TU.radio('$ctrl.searchQueries.status', 1);
  //   await TU.modal.submit();
  //   await GU.expectRowCount(gridId, 0);

  //   await filters.resetFilters();
  // });

  // test('find 0 inventory by state (security reached)', async () => {
  //   await TU.radio('$ctrl.searchQueries.status', 2);
  //   await TU.modal.submit();
  //   await GU.expectRowCount(gridId, 0);

  //   await filters.resetFilters();
  // });

  // test('find 0 inventories by state for grouping (minimum reached)', async () => {
  //   await TU.radio('$ctrl.searchQueries.status', 3);
  //   await TU.modal.submit();

  //   await GU.expectRowCount(gridId, 0);
  //   await filters.resetFilters();
  // });

  // test('find 3 inventories by state (over maximum)', async () => {
  //   await TU.radio('$ctrl.searchQueries.status', 4);
  //   await TU.modal.submit();

  //   await GU.expectRowCount(gridId, 3);
  //   await filters.resetFilters();
  // });

  // test('find 9 inventories for all time ', async () => {
  //   await modal.switchToDefaultFilterTab();
  //   await modal.setPeriod('allTime');
  //   await modal.submit();
  //   await GU.expectRowCount(gridId, 9);
  //   await filters.resetFilters();
  // });

  // test('find 0 inventories who requires a purchase order plus one line of grouping', async () => {
  //   await TU.locator(by.model('$ctrl.searchQueries.require_po')).click();
  //   await TU.modal.submit();
  //   await GU.expectRowCount(gridId, 0);
  //   await filters.resetFilters();
  // });

}

module.exports = StockInventoriesRegistryTests;
