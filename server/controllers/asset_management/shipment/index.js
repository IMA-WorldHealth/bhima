const shipment = require('./shipment');
const shipmentReports = require('./reports/shipments');
const shipmentDocumentReceipt = require('./reports/shipment-document');
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
  setShipmentDelivered : shipment.setShipmentDelivered,
  setShipmentCompleted : shipment.setShipmentCompleted,
  listInTransitInventories : shipment.listInTransitInventories,
  getReport : shipmentReports.getReport,
  getDocument : shipmentDocumentReceipt.getShipmentDocument,
  getBarcode : shipmentBarcodeReceipt.getBarcode,
  writeStockExitShipment : shipment.writeStockExitShipment,
  writeStockEntryShipment : shipment.writeStockEntryShipment,
  updateShipmentStatusAfterEntry : shipment.updateShipmentStatusAfterEntry,
  allocatedAssets : shipment.findAllocatedAssets,
};
