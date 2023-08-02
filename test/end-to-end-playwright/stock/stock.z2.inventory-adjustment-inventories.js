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
    await GU.expectRowCount(gridId, 5 + GROUPING_ROW);
    await filters.resetFilters();
  });

  // test('find only inventories setted during the adjustment process', async () => {
  //   const quinine = {
  //     label : 'Quinine Bichlorhydrate, sirop, 100mg base/5ml, 100ml, flacon, Unité',
  //     quantity : '30',
  //   };
  //   const acide = {
  //     label : 'Acide Acetylsalicylique, 500mg, Tab, 1000, Vrac',
  //     quantity : '360600',
  //   };

  //   await modal.setDepot('Depot Principal');
  //   await modal.submit();
  //   await GU.expectCellValueMatch(gridId, 1, 2, quinine.label);
  //   await GU.expectCellValueMatch(gridId, 1, 4, quinine.quantity);
  //   await GU.expectCellValueMatch(gridId, 2, 2, acide.label);
  //   await GU.expectCellValueMatch(gridId, 2, 4, acide.quantity);
  //   await filters.resetFilters();
  // });
}

module.exports = StockInventoriesRegistryTests;
