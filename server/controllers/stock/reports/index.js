/**
 * @overview
 * Stock Reports
 *
 * This module is responsible for rendering reports of stock.
 *
 * @module stock/reports/
 */

const stockLotsReport = require('./stock/lots_report');
const stockMovementsReport = require('./stock/movements_report');
const stockInventoriesReport = require('./stock/inventories_report');
const stockInventoryReport = require('./stock/inventory_report');
const stockExitPatientReceipt = require('./stock/exit_patient_receipt');
const stockExitDepotReceipt = require('./stock/exit_depot_receipt');
const stockEntryDepotReceipt = require('./stock/entry_depot_receipt');
const stockExitServiceReceipt = require('./stock/exit_service_receipt');
const stockExitLossReceipt = require('./stock/exit_loss_receipt');
const stockEntryPurchaseReceipt = require('./stock/entry_purchase_receipt');
const stockEntryIntegrationReceipt = require('./stock/entry_integration_receipt');
const stockAdjustmentReceipt = require('./stock/adjustment_receipt');

// expose to the api
exports.stockLotsReport = stockLotsReport;
exports.stockMovementsReport = stockMovementsReport;
exports.stockInventoriesReport = stockInventoriesReport;
exports.stockInventoryReport = stockInventoryReport;
exports.stockExitPatientReceipt = stockExitPatientReceipt;
exports.stockExitDepotReceipt = stockExitDepotReceipt;
exports.stockEntryDepotReceipt = stockEntryDepotReceipt;
exports.stockExitServiceReceipt = stockExitServiceReceipt;
exports.stockExitLossReceipt = stockExitLossReceipt;
exports.stockEntryPurchaseReceipt = stockEntryPurchaseReceipt;
exports.stockEntryIntegrationReceipt = stockEntryIntegrationReceipt;
exports.stockAdjustmentReceipt = stockAdjustmentReceipt;
