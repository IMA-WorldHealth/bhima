// libraries
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');
const NotFound = require('../../../../lib/errors/NotFound');
const { formatFilters } = require('../../../finance/reports/shared');
const barcode = require('../../../../lib/barcode');
const identifiers = require('../../../../config/identifiers');
const Shipment = require('../shipment');
const ShipmentContainer = require('../shipment_containers');

// handlebars templates
const BASE_URL = './server/controllers/asset_management/shipment';
const SHIPMENTS_REPORT_TEMPLATE = `${BASE_URL}/reports/shipments.handlebars`;
const SHIPMENT_DOCUMENT_TEMPLATE = `${BASE_URL}/reports/shipment-document.handlebars`;
const SHIPMENT_GOODS_RECEIVED_NOTE_TEMPLATE = `${BASE_URL}/reports/shipment-goods-received-note.handlebars`;
const SHIPMENT_MANIFEST_TEMPLATE = `${BASE_URL}/reports/shipment-manifest.handlebars`;
const SHIPMENT_BARCODE_TEMPLATE = `${BASE_URL}/reports/shipment-barcode.handlebars`;

module.exports = {
  // export common library
  db,
  ReportManager,
  NotFound,
  formatFilters,
  barcode,
  identifiers,
  Shipment,
  ShipmentContainer,

  // export handlebars templates
  SHIPMENTS_REPORT_TEMPLATE,
  SHIPMENT_DOCUMENT_TEMPLATE,
  SHIPMENT_GOODS_RECEIVED_NOTE_TEMPLATE,
  SHIPMENT_MANIFEST_TEMPLATE,
  SHIPMENT_BARCODE_TEMPLATE,
};
