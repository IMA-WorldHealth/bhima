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
  addShipmentTrackingLogEntry : shipment.addShipmentTrackingLogEntry,
  setReadyForShipment : shipment.setReadyForShipment,
  setShipmentCompleted : shipment.setShipmentCompleted,
  listInTransitInventories : shipment.listInTransitInventories,
  getReport : shipmentReports.getReport,
  getOverview : shipmentOverviewReceipt.getShipmentOverview,
  getBarcode : shipmentBarcodeReceipt.getBarcode,
  writeStockExitShipment : shipment.writeStockExitShipment,
  writeStockEntryShipment : shipment.writeStockEntryShipment,
  updateShipmentStatusAfterEntry : shipment.updateShipmentStatusAfterEntry,
  affectedAssets : shipment.findAffectedAssets,
};
