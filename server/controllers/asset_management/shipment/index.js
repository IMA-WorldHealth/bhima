const shipment = require('./shipment');
const shipmentReports = require('./reports/shipments');

module.exports = {
  list : shipment.list,
  details : shipment.details,
  update : shipment.update,
  create : shipment.create,
  listInTransitInventories : shipment.listInTransitInventories,
  getReport : shipmentReports.getReport,
};
