/* global */
const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');
const SearchModal = require('../shared/search.page');
const Filters = require('../shared/components/bhFilters');

module.exports = StockInventoriesRegistryTests;

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

  it('find 2 inventory in Depot Principal plus one line for the Grouping', async () => {
    await modal.setDepot('Depot Principal');
    await modal.submit();
    await GU.expectRowCount(gridId, 2 + depotGroupingRow);
    await filters.resetFilters();
  });
}
