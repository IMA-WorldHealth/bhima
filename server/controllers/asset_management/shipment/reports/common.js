// libraries
const ReportManager = require('../../../../lib/ReportManager');
const NotFound = require('../../../../lib/errors/NotFound');
const { formatFilters } = require('../../../finance/reports/shared');
const barcode = require('../../../../lib/barcode');
const identifiers = require('../../../../config/identifiers');
const shipment = require('../shipment');

// hanldebars templates
const BASE_URL = './server/controllers/asset_management/shipment';
const SHIPMENTS_REPORT_TEMPLATE = `${BASE_URL}/reports/shipments.handlebars`;
const SHIPMENT_OVERVIEW_TEMPLATE = `${BASE_URL}/reports/shipment-overview.handlebars`;

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
  SHIPMENT_OVERVIEW_TEMPLATE,
};
