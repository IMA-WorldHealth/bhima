const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

const PurchaseOrderSearch = require('./registry.search');

// purchase order registry tests
test.describe('Purchase Order Registry', () => {

  // Purchase Order search modal queries
  test.describe('Search', PurchaseOrderSearch);

});
