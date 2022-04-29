const shipment = require('./shipment');
const shipmentReports = require('./reports/shipments');
const shipmentOverviewReceipt = require('./reports/shipment-overview');
const shipmentBarcodeReceipt = require('./reports/shipment-barcode');

module.exports = {
  list : shipment.list,
  details : shipment.details,
  overview : shipment.overview,
  single : shipment.single,
  update : shipment.update,
  create : shipment.create,
  deleteShipment : shipment.deleteShipment,
  updateTrackingLog : shipment.updateShipmentTrackingLog,
  setReadyForShipment : shipment.setReadyForShipment,
  listInTransitInventories : shipment.listInTransitInventories,
  getReport : shipmentReports.getReport,
  getOverview : shipmentOverviewReceipt.getShipmentOverview,
  getBarcode : shipmentBarcodeReceipt.getBarcode,
  writeStockExitShipment : shipment.writeStockExitShipment,
  writeStockEntryShipment : shipment.writeStockEntryShipment,
  updateShipmentStatusAfterEntry : shipment.updateShipmentStatusAfterEntry,
  allocatedAssets : shipment.findAllocatedAssets,
};
