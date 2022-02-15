const shipment = require('./shipment');
const shipmentReports = require('./reports/shipments');

module.exports = {
  list : shipment.list,
  listInTransitInventories : shipment.listInTransitInventories,
  getReport : shipmentReports.getReport,
};
