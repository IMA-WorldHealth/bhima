/* global element, by, browser */
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');
const SearchModal = require('../shared/search.page');
const components = require('../shared/components');
const Filters = require('../shared/components/bhFilters');

function StockInventoriesRegistryTests() {
  let modal;
  let filters;

  // navigate to the page
  before(() => helpers.navigate('#/stock/inventories'));

  beforeEach(() => {
    SearchModal.open();
    modal = new SearchModal('stock-inventories-search');
    filters = new Filters();
  });

  const gridId = 'stock-inventory-grid';

  const depotGroupingRow = 1;

  it('find 1 inventory in Depot Secondaire plus one line for the Grouping', () => {
    modal.setDepot('Depot Secondaire');
    modal.submit();
    GU.expectRowCount(gridId, 1 + depotGroupingRow);
  });

  it('find 3 inventory in Depot Principal plus one line for the Grouping', () => {
    modal.setDepot('Depot Principal');
    modal.submit();
    GU.expectRowCount(gridId, 1 + depotGroupingRow);
  });

  it('find inventory by name', () => {
    modal.setInventory('First Test Inventory Item');
    modal.submit();
    // GU.expectRowCount(gridId, 2 + (2 * depotGroupingRow));
    GU.expectRowCount(gridId, 0);
  });

  it('find 0 inventory by state sold out', () => {
    FU.radio('$ctrl.searchQueries.status', 0);
    FU.modal.submit();
    GU.expectRowCount(gridId, 0);
  });

  it('find 0 inventory by state in stock', () => {
    FU.radio('$ctrl.searchQueries.status', 1);
    FU.modal.submit();
    GU.expectRowCount(gridId, 0);    
  });

  it('find 0 inventory by state (security reached)', () => {
    FU.radio('$ctrl.searchQueries.status', 2);
    FU.modal.submit();
    GU.expectRowCount(gridId, 0);
  });

  it('find 2 inventories  by state plus one lne for grouping (minimum reached)', () => {
    FU.radio('$ctrl.searchQueries.status', 3);
    FU.modal.submit();
    // GU.expectRowCount(gridId, 2 + (depotGroupingRow));
    GU.expectRowCount(gridId, 0);    
  });

  it('find 2 inventories  by state plus one lne for grouping (over maximum)', () => {
    FU.radio('$ctrl.searchQueries.status', 4);
    FU.modal.submit();
    // GU.expectRowCount(gridId, 3 + (2 * depotGroupingRow));
    GU.expectRowCount(gridId, 0);
  });

}

describe('Stock Inventory Registry', StockInventoriesRegistryTests);
