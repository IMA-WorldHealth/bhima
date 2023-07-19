const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const CostCentersPage = require('./costCenters.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Cost Center', () => {

  test.beforeEach(async () => {
    await TU.navigate('/#!/cost_center');
  });

  const page = new CostCentersPage();

  const dataset = {
    fiscal_id : 4,
    periodFrom_id : 201801,
    periodTo_id : 201812,
    profitCenter : 1,
  };

  const datasetManual = {
    fiscal_id : 4,
    periodFrom_id : 201801,
    periodTo_id : 201812,
    profitCenter : 0,
    label : 'Auxiliary 1',
    trans_id : 'TPA37',
  };

  test.skip('set allocation by percentage', async () => {
    // @TODO: Rework test for changed cost centers
    await page.setDistributionPercentage(dataset);
  });

  test.skip('set automatic allocation of invoice', async () => {
    // @TODO: Rework test for changed cost centers
    await page.setDistributionAutomatic(dataset);
  });

  test.skip('set manual allocation by value', async () => {
    // @TODO: Rework test for changed cost centers
    await page.setDistributionManual(datasetManual);
  });
});

test.describe('Update Cost Center', () => {

  test.beforeEach(async () => {
    await TU.navigate('#!/allocation_center/update');
  });

  const page = new CostCentersPage();

  const dataset = {
    fiscal_id : 4,
    periodFrom_id : 201801,
    periodTo_id : 201812,
    costCenter : 1,
    trans_id : 'TPA37',
  };

  test.skip('Update Distributed Cost Center', async () => {
    // @TODO: Rework test for changed cost centers
    await page.setUpdatedDistribution(dataset);
  });
});
