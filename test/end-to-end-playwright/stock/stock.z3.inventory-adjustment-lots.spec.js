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

function StockLotsRegistryTests() {
  const path = '/#/stock/lots';
  let modal;
  let filters;

  // navigate to the page
  test.beforeEach(async () => {
    await TU.navigate(path);
    modal = new SearchModal('stock-lots-search', path);
    await modal.open();
    filters = new Filters();
  });

  test.afterEach(async () => {
    await filters.resetFilters();
  });

  const gridId = 'stock-lots-grid';
  const LOT_FOR_ALLTIME = 16;
  const GROUPING_ROW = 1;

  test(`finds ${LOT_FOR_ALLTIME} lots for all time`, async () => {
    await modal.setDepot('Depot Principal');
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('allTime');
    await modal.submit();
    await GU.expectRowCount(gridId, GROUPING_ROW + LOT_FOR_ALLTIME);
  });

  // test.skip('find only lots set during the adjustment process', async () => {
  //   const acide = {
  //     label : 'Acide Acetylsalicylique, 500mg, Tab, 1000, Vrac',
  //     lot : 'ASB17001',
  //     quantity : '17',
  //   };

  //   const vitamine = {
  //     label : 'Vitamines B1+B6+B12, 100+50+0.5mg/2ml, Amp, Unité',
  //     lot : 'VITAMINE-B',
  //     quantity : '23',
  //   };

  //   await modal.setDepot('Depot Principal');

  //   // set the default value for include/exclude exhausted lots.
  //   await modal.switchToDefaultFilterTab();
  //   await TU.locator('[data-exclude-exhausted-lots]').click();

  //   await modal.submit();

  //   const offset = 2;

  //   await GU.expectCellValueMatch(gridId, offset + 1, 2, vitamine.label);
  //   await GU.expectCellValueMatch(gridId, offset + 1, 4, vitamine.lot);
  //   await GU.expectCellValueMatch(gridId, offset + 1, 5, vitamine.quantity);
  //   await GU.expectCellValueMatch(gridId, offset + 2, 2, acide.label);
  //   await GU.expectCellValueMatch(gridId, offset + 2, 4, acide.lot);
  //   await GU.expectCellValueMatch(gridId, offset + 2, 5, acide.quantity);

  //   await filters.resetFilters();
  // });

}

module.exports = StockLotsRegistryTests;
