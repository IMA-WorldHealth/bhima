/* global */

const StockExiTests = require('./stock.exit');
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

describe('Stock end-to-end test', () => {
  describe('Stock Aggregate ConsumptionTests', StockAggregateConsumptionTests);
  describe('Stock Adjustment Test', StockAdjustmentTests);
  describe('Stock Assign Module', StockAssignTests);
  describe('Stock Entry Test', StockEntryTests);
  describe('Stock Exit Test', StockExiTests);
  describe('Stock Import', StockImportTests);
  describe('Stock Inventory Registry', StockInventoriesRegistryTests);
  describe('Stock Lots Registry', StockLotsRegistryTests);
  describe('Stock Movement Registry', StockMovementsRegistryTests);
  describe('Stock Requisition Module', StockRequisitionTests);
  describe('Stock Inventory Adjustment', StockInventoryAdjustement);
  describe('Stock Setting', StockSetting);
});
