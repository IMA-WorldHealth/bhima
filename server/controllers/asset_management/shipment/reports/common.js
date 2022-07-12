// libraries
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');
const NotFound = require('../../../../lib/errors/NotFound');
const { formatFilters } = require('../../../finance/reports/shared');
const barcode = require('../../../../lib/barcode');
const identifiers = require('../../../../config/identifiers');
const shipment = require('../shipment');

// handlebars templates
const BASE_URL = './server/controllers/asset_management/shipment';
const SHIPMENTS_REPORT_TEMPLATE = `${BASE_URL}/reports/shipments.handlebars`;
const SHIPMENT_OVERVIEW_TEMPLATE = `${BASE_URL}/reports/shipment-overview.handlebars`;
const SHIPMENT_BARCODE_TEMPLATE = `${BASE_URL}/reports/shipment-barcode.handlebars`;

module.exports = {
  // export common library
  db,
  ReportManager,
  NotFound,
  formatFilters,
  barcode,
  identifiers,
  shipment,

  // export handlebars templates
  SHIPMENTS_REPORT_TEMPLATE,
  SHIPMENT_OVERVIEW_TEMPLATE,
  SHIPMENT_BARCODE_TEMPLATE,
};
