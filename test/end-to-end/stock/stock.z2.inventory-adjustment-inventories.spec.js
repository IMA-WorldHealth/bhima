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

  it('find 2 inventory in Depot Principal plus one line for the Grouping', async () => {
    await modal.setDepot('Depot Principal');
    await modal.submit();
    await GU.expectRowCount(gridId, 2 + GROUPING_ROW);
    await filters.resetFilters();
  });

  it('find only inventories setted during the adjustment process', async () => {
    const quinine = {
      label : 'Quinine Bichlorhydrate, sirop, 100mg base/5ml, 100ml, flacon, Unité',
      quantity : '17',
    };
    const vitamine = {
      label : 'Vitamines B1+B6+B12, 100+50+0.5mg/2ml, Amp, Unité',
      quantity : '23',
    };
    await modal.setDepot('Depot Principal');
    await modal.submit();
    await GU.expectCellValueMatch(gridId, 1, 2, quinine.label);
    await GU.expectCellValueMatch(gridId, 1, 4, quinine.quantity);
    await GU.expectCellValueMatch(gridId, 2, 2, vitamine.label);
    await GU.expectCellValueMatch(gridId, 2, 4, vitamine.quantity);
    await filters.resetFilters();
  });
}
