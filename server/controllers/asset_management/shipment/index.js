const shipment = require('./shipment');
const shipmentReports = require('./reports/shipments');
const shipmentOverviewReceipt = require('./reports/shipment-overview');

module.exports = {
  list : shipment.list,
  details : shipment.details,
  single : shipment.single,
  update : shipment.update,
  create : shipment.create,
  deleteShipment : shipment.deleteShipment,
  updateLocation : shipment.updateLocation,
  setReadyForShipment : shipment.setReadyForShipment,
  listInTransitInventories : shipment.listInTransitInventories,
  getReport : shipmentReports.getReport,
  getOverview : shipmentOverviewReceipt.getShipmentOverview,
  writeStockExitShipment : shipment.writeStockExitShipment,
  writeStockEntryShipment : shipment.writeStockEntryShipment,
  updateShipmentStatusAfterEntry : shipment.updateShipmentStatusAfterEntry,
};
