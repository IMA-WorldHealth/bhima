// Constants
const BASE_PATH = './server/controllers/stock/reports';

// receipts
const STOCK_EXIT_PATIENT_TEMPLATE = `${BASE_PATH}/stock_exit_patient.receipt.handlebars`;
const POS_STOCK_EXIT_PATIENT_TEMPLATE = `${BASE_PATH}/stock_exit_patient.receipt.pos.handlebars`;
const STOCK_EXIT_SERVICE_TEMPLATE = `${BASE_PATH}/stock_exit_service.receipt.handlebars`;
const POS_STOCK_EXIT_SERVICE_TEMPLATE = `${BASE_PATH}/stock_exit_service.receipt.pos.handlebars`;
const STOCK_EXIT_DEPOT_TEMPLATE = `${BASE_PATH}/stock_exit_depot.receipt.handlebars`;
const POS_STOCK_EXIT_DEPOT_TEMPLATE = `${BASE_PATH}/stock_exit_depot.receipt.pos.handlebars`;
const STOCK_EXIT_LOSS_TEMPLATE = `${BASE_PATH}/stock_exit_loss.receipt.handlebars`;
const POS_STOCK_EXIT_LOSS_TEMPLATE = `${BASE_PATH}/stock_exit_loss.receipt.pos.handlebars`;
const STOCK_ASSIGN_TEMPLATE = `${BASE_PATH}/stock_assign.receipt.handlebars`;
const STOCK_CONSUMPTION_GRAPTH_TEMPLATE = `${BASE_PATH}/stock_consumption_graph.handlebars`;
const STOCK_MOVEMENT_REPORT_TEMPLATE = `${BASE_PATH}/stock_movement_report.handlebars`;

const STOCK_ENTRY_DEPOT_TEMPLATE = `${BASE_PATH}/stock_entry_depot.receipt.handlebars`;
const STOCK_ENTRY_PURCHASE_TEMPLATE = `${BASE_PATH}/stock_entry_purchase.receipt.handlebars`;
const STOCK_ENTRY_INTEGRATION_TEMPLATE = `${BASE_PATH}/stock_entry_integration.receipt.handlebars`;
const STOCK_ENTRY_DONATION_TEMPLATE = `${BASE_PATH}/stock_entry_donation.receipt.handlebars`;
const STOCK_ADJUSTMENT_TEMPLATE = `${BASE_PATH}/stock_adjustment.receipt.handlebars`;

const STOCK_AGGREGATE_CONSUMPTION_TEMPLATE = `${BASE_PATH}/stock_aggregate_consumption.receipt.handlebars`;

// reports
const STOCK_EXIT_REPORT_TEMPLATE = `${BASE_PATH}/stock_exit.report.handlebars`;
const STOCK_ENTRY_REPORT_TEMPLATE = `${BASE_PATH}/stock_entry.report.handlebars`;
const STOCK_LOTS_REPORT_TEMPLATE = `${BASE_PATH}/stock_lots.report.handlebars`;
const STOCK_MOVEMENTS_REPORT_TEMPLATE = `${BASE_PATH}/stock_movements.report.handlebars`;
const STOCK_INLINE_MOVEMENTS_REPORT_TEMPLATE = `${BASE_PATH}/stock_inline_movements.report.handlebars`;
const STOCK_INVENTORIES_REPORT_TEMPLATE = `${BASE_PATH}/stock_inventories.report.handlebars`;
const STOCK_SHEET_REPORT_TEMPLATE = `${BASE_PATH}/stock_sheet.report.handlebars`;
const STOCK_VALUE_REPORT_TEMPLATE = `${BASE_PATH}/stock_value.report.handlebars`;
const STOCK_EXPIRATION_REPORT_TEMPLATE = `${BASE_PATH}/stock_expiration_report.handlebars`;
const STOCK_AGGREGATED_CONSUMPTION_REPORT_TEMPLATE = `${BASE_PATH}/stock_aggregated_consumption_report.handlebars`;

// General imports
const _ = require('lodash');
const moment = require('moment');

// Application-specific imports
const q = require('q');
const db = require('../../../lib/db');
const util = require('../../../lib/util');
const Stock = require('../core');
const ReportManager = require('../../../lib/ReportManager');
const NotFound = require('../../../lib/errors/NotFound');
const identifiers = require('../../../config/identifiers');
const pdf = require('../../../lib/renderers/pdf');
const barcode = require('../../../lib/barcode');
const { formatFilters } = require('../../finance/reports/shared');

/**
 * getDepotMovement
 * @param {string} documentUuid
 * @param {object} enterprise
 * @param {boolean} isExit
 * @description return depot movement informations
 * @return {object} data
 */
async function getDepotMovement(documentUuid, enterprise, isExit) {
  const data = {};
  const isExitValue = isExit ? 1 : 0;
  const isEntry = isExitValue === 0;

  const lookupExitParameters = [1, Stock.flux.TO_OTHER_DEPOT, db.bid(documentUuid)];
  const lookupEntryParameters = [0, Stock.flux.FROM_OTHER_DEPOT, db.bid(documentUuid)];
  const parameters = isEntry ? lookupExitParameters.concat(lookupEntryParameters) : lookupExitParameters;

  const joinToExitAttributes = isEntry ? `
    , IFNULL(ex.quantity, 0) AS quantity_sent, IFNULL((ex.quantity - m.quantity), 0) AS quantity_difference
    ` : '';

  const joinToExit = isEntry ? `
    LEFT JOIN (
      SELECT m.document_uuid, m.lot_uuid, m.quantity
      FROM stock_movement m
      WHERE m.is_exit = ? AND m.flux_id = ? AND m.document_uuid = ?
    )ex ON ex.document_uuid = m.document_uuid AND ex.lot_uuid = m.lot_uuid
    ` : '';

  const sql = `
    SELECT
      i.code, i.text, iu.text AS unit, BUID(m.document_uuid) AS document_uuid,
      m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total, m.date, m.description,
      u.display_name AS user_display_name,
      dm.text AS document_reference,
      l.label, l.expiration_date, d.text AS depot_name, dd.text as otherDepotName,
      BUID(m.stock_requisition_uuid) AS stock_requisition_uuid, sr_m.text AS document_requisition
      ${joinToExitAttributes}
    FROM stock_movement m
      JOIN lot l ON l.uuid = m.lot_uuid
      JOIN inventory i ON i.uuid = l.inventory_uuid
      JOIN inventory_unit iu ON iu.id = i.unit_id
      JOIN depot d ON d.uuid = m.depot_uuid
      JOIN user u ON u.id = m.user_id
      LEFT JOIN depot dd ON dd.uuid = entity_uuid
      LEFT JOIN document_map dm ON dm.uuid = m.document_uuid
      LEFT JOIN document_map sr_m ON sr_m.uuid = m.stock_requisition_uuid
      ${joinToExit}
    WHERE m.is_exit = ? AND m.flux_id = ? AND m.document_uuid = ?
    ORDER BY i.text, l.label, l.expiration_date DESC`;

  const rows = await db.exec(sql, parameters);

  if (!rows.length) { throw new NotFound('document not found'); }

  const line = rows[0];

  data.enterprise = enterprise;
  const key = isExit ? 'exit' : 'entry';
  data[key] = {};

  data[key].details = {
    depot_name         : line.depot_name,
    otherDepotName     : line.otherDepotName || '',
    user_display_name  : line.user_display_name,
    description        : line.description,
    date               : line.date,
    document_uuid      : line.document_uuid,
    document_reference : line.document_reference,
    document_requisition : line.document_requisition,
  };

  data.rows = rows;

  return data;
}

// Extensible PDF layout options
const pdfOptions = {
  orientation : 'landscape',
};

async function getVoucherReferenceForStockMovement(documentUuid) {
  const sql = `
    SELECT v.uuid, dm.text AS voucher_reference
    FROM voucher AS v
      JOIN voucher_item AS vi ON vi.voucher_uuid = v.uuid
      JOIN document_map AS dm ON dm.uuid = v.uuid
    WHERE vi.document_uuid = ?
    LIMIT 1;
  `;

  return db.exec(sql, [db.bid(documentUuid)]);
}

/**
 * Stock Receipt API
 * /receipts/stock/{{name}}/:document_uuid
 *
 * the {{name}} is what we define for example in { key : 'FROM_PURCHASE', path :'entry_purchase' },
 *
 * empty {{name}} means that there is no API entry for this name.
 */
const stockFluxReceipt = {
  1  : { key : 'FROM_PURCHASE', path : 'entry_purchase' },
  2  : { key : 'FROM_OTHER_DEPOT', path : 'entry_depot' },
  3  : { key : 'FROM_ADJUSTMENT', path : 'adjustment' },
  4  : { key : 'FROM_PATIENT', path : '' },
  5  : { key : 'FROM_SERVICE', path : '' },
  6  : { key : 'FROM_DONATION', path : 'entry_donation' },
  7  : { key : 'FROM_LOSS', path : 'entry_loss' },
  8  : { key : 'TO_OTHER_DEPOT', path : 'exit_depot' },
  9  : { key : 'TO_PATIENT', path : 'exit_patient' },
  10 : { key : 'TO_SERVICE', path : 'exit_service' },
  11 : { key : 'TO_LOSS', path : 'exit_loss' },
  12 : { key : 'TO_ADJUSTMENT', path : 'adjustment' },
  13 : { key : 'FROM_INTEGRATION', path : 'entry_integration' },
  14 : { key : 'INVENTORY_RESET', path : 'adjustment' },
  15 : { key : 'INVENTORY_ADJUSTMENT', path : 'adjustment' },
};

// Exports
module.exports = {
  _,
  moment,
  q,
  db,
  util,
  pdf,
  barcode,
  Stock,
  ReportManager,
  NotFound,
  stockFluxReceipt,
  formatFilters,
  identifiers,
  getDepotMovement,
  getVoucherReferenceForStockMovement,
  pdfOptions,
  STOCK_EXIT_PATIENT_TEMPLATE,
  POS_STOCK_EXIT_PATIENT_TEMPLATE,
  STOCK_EXIT_SERVICE_TEMPLATE,
  POS_STOCK_EXIT_SERVICE_TEMPLATE,
  STOCK_EXIT_DEPOT_TEMPLATE,
  POS_STOCK_EXIT_DEPOT_TEMPLATE,
  STOCK_EXIT_LOSS_TEMPLATE,
  POS_STOCK_EXIT_LOSS_TEMPLATE,
  STOCK_ASSIGN_TEMPLATE,
  STOCK_ENTRY_DEPOT_TEMPLATE,
  STOCK_ENTRY_PURCHASE_TEMPLATE,
  STOCK_ENTRY_INTEGRATION_TEMPLATE,
  STOCK_ENTRY_DONATION_TEMPLATE,
  STOCK_ADJUSTMENT_TEMPLATE,
  STOCK_EXIT_REPORT_TEMPLATE,
  STOCK_ENTRY_REPORT_TEMPLATE,
  STOCK_LOTS_REPORT_TEMPLATE,
  STOCK_MOVEMENTS_REPORT_TEMPLATE,
  STOCK_INLINE_MOVEMENTS_REPORT_TEMPLATE,
  STOCK_SHEET_REPORT_TEMPLATE,
  STOCK_INVENTORIES_REPORT_TEMPLATE,
  STOCK_VALUE_REPORT_TEMPLATE,
  STOCK_CONSUMPTION_GRAPTH_TEMPLATE,
  STOCK_MOVEMENT_REPORT_TEMPLATE,
  STOCK_EXPIRATION_REPORT_TEMPLATE,
  STOCK_AGGREGATE_CONSUMPTION_TEMPLATE,
  STOCK_AGGREGATED_CONSUMPTION_REPORT_TEMPLATE,
};
