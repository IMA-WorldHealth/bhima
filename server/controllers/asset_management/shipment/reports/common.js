// libraries
const ReportManager = require('../../../../lib/ReportManager');
const NotFound = require('../../../../lib/errors/NotFound');
const { formatFilters } = require('../../../finance/reports/shared');
const barcode = require('../../../../lib/barcode');
const identifiers = require('../../../../config/identifiers');
const shipment = require('../shipment');

// hanldebars templates
const SHIPMENTS_REPORT_TEMPLATE = './server/controllers/asset_management/shipment/reports/shipments.handlebars';

module.exports = {
  // export common library
  ReportManager,
  NotFound,
  formatFilters,
  barcode,
  identifiers,
  shipment,

  // export handlebars templates
  SHIPMENTS_REPORT_TEMPLATE,
};
