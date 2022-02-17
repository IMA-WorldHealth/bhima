const shipment = require('./shipment');
const shipmentReports = require('./reports/shipments');

module.exports = {
  list : shipment.list,
  details : shipment.details,
  single : shipment.single,
  update : shipment.update,
  create : shipment.create,
  updateLocation : shipment.updateLocation,
  setReadyForShipment : shipment.setReadyForShipment,
  listInTransitInventories : shipment.listInTransitInventories,
  getReport : shipmentReports.getReport,
  writeStockExitShipment : shipment.writeStockExitShipment,
  writeStockEntryShipment : shipment.writeStockEntryShipment,
  updateShipmentStatusAfterEntry : shipment.updateShipmentStatusAfterEntry,
};
