const { chromium } = require('@playwright/test');
const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

/* global */

const StockExitTests = require('./stock.exit');
const StockAdjustmentTests = require('./stock.adjustment');
const StockAssignTests = require('./stock.assign');
const StockEntryTests = require('./stock.entry');
const StockImportTests = require('./stock.import');
const StockInventoriesRegistryTests = require('./stock.inventories');
const StockLotsRegistryTests = require('./stock.lots');
const StockMovementsRegistryTests = require('./stock.movements');
const StockRequisitionTests = require('./stock.requisition');
const StockInventoryAdjustement = require('./stock.z1.inventory-adjustment');
const StockSetting = require('./stock.setting');
const StockAggregateConsumptionTests = require('./stock.aggregate_consumption');

test.describe('Stock end-to-end test', () => {
  test.describe('Stock Aggregate ConsumptionTests', StockAggregateConsumptionTests);
  // test.describe('Stock Adjustment Test', StockAdjustmentTests);
  // test.describe('Stock Assign Module', StockAssignTests);
  // test.describe('Stock Entry Test', StockEntryTests);
  // test.describe('Stock Exit Test', StockExitTests);
  // test.describe('Stock Import', StockImportTests);
  // test.describe('Stock Inventory Registry', StockInventoriesRegistryTests);
  // test.describe('Stock Lots Registry', StockLotsRegistryTests);
  // test.describe('Stock Movement Registry', StockMovementsRegistryTests);
  // test.describe('Stock Requisition Module', StockRequisitionTests);
  // test.describe('Stock Inventory Adjustment', StockInventoryAdjustement);
  // test.describe('Stock Setting', StockSetting);
});
