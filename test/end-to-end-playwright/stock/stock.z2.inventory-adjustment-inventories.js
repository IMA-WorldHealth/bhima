const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const GU = require('../shared/GridUtils');
const SearchModal = require('../shared/search.page');
const Filters = require('../shared/components/bhFilters');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

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
  const GROUPING_ROW = 1;

  test('find 5 inventory in Depot Principal plus one line for the Grouping', async () => {
    await modal.setDepot('Depot Principal');
    await modal.submit();
    await GU.expectRowCount(gridId, 2 + GROUPING_ROW);
    await filters.resetFilters();
  });

  test('find only inventories set during the adjustment process', async () => {
    const moto = {
      label : 'Honda CRF250RX',
      quantity : '18',
    };
    const quinine = {
      label : 'Quinine Bichlorhydrate, sirop, 100mg base/5ml, 100ml, flacon, Unité',
      quantity : '23',
    };

    await modal.setDepot('Depot Principal');
    await modal.submit();
    await GU.expectCellValueMatch(gridId, 1, 2, moto.label);
    await GU.expectCellValueMatch(gridId, 1, 4, moto.quantity);
    await GU.expectCellValueMatch(gridId, 2, 2, quinine.label);
    await GU.expectCellValueMatch(gridId, 2, 4, quinine.quantity);
    await filters.resetFilters();
  });
}

module.exports = StockInventoriesRegistryTests;
