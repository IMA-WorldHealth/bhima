const { chromium } = require('@playwright/test');
const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const components = require('../shared/components');

const CostCentersKeysPage = require('./costCenterKeys.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Distribution keys Management', () => {
  test.beforeEach(async () => {
    await TU.navigate('/#!/cost_center/allocation_bases');
  });

  const page = new CostCentersKeysPage();
  const labelAuxiliary1 = 'Auxiliary 1';
  const labelAuxiliary2 = 'Auxiliary 2';
  const resetAuxiliary2 = 'Auxiliary 3';
  const allocationKeyElements = 10;

  test.skip('set allocation key for an Auxiliary Cost Center', async () => {
    // First, update the allocation keys
    await TU.locator('[data-method="update"]').click();
    await components.notification.hasSuccess();
    await page.setDistributionKey(labelAuxiliary1);
  });

  test.skip('prevent initialization of allocation keys greater than 100 percent', async () => {
    await page.preventGreaterLess100(labelAuxiliary2);
  });

  test.skip('displays all allocations keys loaded from the database', async () => {
    expect(await page.getDistributionKeyCount()).toBe(allocationKeyElements);
  });

  test.skip('reset allocations key for an Auxiliary Cost Center', async () => {
    await page.resetDistributionKey(resetAuxiliary2);
  });
});
