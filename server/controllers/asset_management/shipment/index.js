const shipment = require('./shipment');
const shipmentReports = require('./reports/shipments');
const shipmentOverviewReceipt = require('./reports/shipment-overview');

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
  writeStockExitShipment : shipment.writeStockExitShipment,
  writeStockEntryShipment : shipment.writeStockEntryShipment,
  updateShipmentStatusAfterEntry : shipment.updateShipmentStatusAfterEntry,
};
