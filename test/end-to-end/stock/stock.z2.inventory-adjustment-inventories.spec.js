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
  const GROUPING_ROW = 1;

  it('find 5 inventory in Depot Principal plus one line for the Grouping', async () => {
    await modal.setDepot('Depot Principal');
    await modal.submit();
    await GU.expectRowCount(gridId, 5 + GROUPING_ROW);
    await filters.resetFilters();
  });

  it('find only inventories setted during the adjustment process', async () => {
    const quinine = {
      label : 'Quinine Bichlorhydrate, sirop, 100mg base/5ml, 100ml, flacon, Unité',
      quantity : '30',
    };
    const acide = {
      label : 'Acide Acetylsalicylique, 500mg, Tab, 1000, Vrac',
      quantity : '360600',
    };

    await modal.setDepot('Depot Principal');
    await modal.submit();
    await GU.expectCellValueMatch(gridId, 1, 2, quinine.label);
    await GU.expectCellValueMatch(gridId, 1, 4, quinine.quantity);
    await GU.expectCellValueMatch(gridId, 2, 2, acide.label);
    await GU.expectCellValueMatch(gridId, 2, 4, acide.quantity);
    await filters.resetFilters();
  });
}
