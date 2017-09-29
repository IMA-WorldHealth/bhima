// Constants
const BASE_PATH = './server/controllers/stock/reports';

// receipts
const STOCK_EXIT_PATIENT_TEMPLATE = `${BASE_PATH}/stock_exit_patient.receipt.handlebars`;
const STOCK_EXIT_SERVICE_TEMPLATE = `${BASE_PATH}/stock_exit_service.receipt.handlebars`;
const STOCK_EXIT_DEPOT_TEMPLATE = `${BASE_PATH}/stock_exit_depot.receipt.handlebars`;
const STOCK_EXIT_LOSS_TEMPLATE = `${BASE_PATH}/stock_exit_loss.receipt.handlebars`;

const STOCK_ENTRY_DEPOT_TEMPLATE = `${BASE_PATH}/stock_entry_depot.receipt.handlebars`;
const STOCK_ENTRY_PURCHASE_TEMPLATE = `${BASE_PATH}/stock_entry_purchase.receipt.handlebars`;
const STOCK_ENTRY_INTEGRATION_TEMPLATE = `${BASE_PATH}/stock_entry_integration.receipt.handlebars`;
const STOCK_ENTRY_DONATION_TEMPLATE = `${BASE_PATH}/stock_entry_donation.receipt.handlebars`;
const STOCK_ADJUSTMENT_TEMPLATE = `${BASE_PATH}/stock_adjustment.receipt.handlebars`;

// reports
const STOCK_LOTS_REPORT_TEMPLATE = `${BASE_PATH}/stock_lots.report.handlebars`;
const STOCK_MOVEMENTS_REPORT_TEMPLATE = `${BASE_PATH}/stock_movements.report.handlebars`;
const STOCK_INVENTORIES_REPORT_TEMPLATE = `${BASE_PATH}/stock_inventories.report.handlebars`;
const STOCK_INVENTORY_REPORT_TEMPLATE = `${BASE_PATH}/stock_inventory.report.handlebars`;

// General imports
const _ = require('lodash');

// Application-specific imports
const db = require('../../../lib/db');
const Stock = require('../core');
const ReportManager = require('../../../lib/ReportManager');
const PeriodService = require('../../../lib/period');
const NotFound = require('../../../lib/errors/NotFound');
const identifiers = require('../../../config/identifiers');

/*
* This function help to format filter display name
* Whitch must appear in the report
*/
function formatFilters(qs) {
  const columns = [
    { field : 'depot_uuid', displayName : 'STOCK.DEPOT' },
    { field : 'inventory_uuid', displayName : 'STOCK.INVENTORY' },
    { field : 'status', displayName : 'FORM.LABELS.STATUS' },
    { field : 'defaultPeriod', displayName : 'TABLE.COLUMNS.PERIOD', isPeriod : true },
    { field : 'period', displayName : 'TABLE.COLUMNS.PERIOD', isPeriod : true },
    { field : 'limit', displayName : 'FORM.LABELS.LIMIT' },

    { field : 'entry_date_from', displayName : 'STOCK.ENTRY_DATE', comparitor : '>', isDate : true },
    { field : 'entry_date_to', displayName : 'STOCK.ENTRY_DATE', comparitor : '<', isDate : true },
  ];

  return columns.filter(column => {
    const value = qs[column.field];

    if (!_.isUndefined(value)) {
      if (column.isPeriod) {
        const service = new PeriodService(new Date());
        column.value = service.periods[value].translateKey;
      } else {
        column.value = value;
      }
      return true;
    }
    return false;
  });
}


/**
 * getDepotMovement
 * @param {string} documentUuid
 * @param {object} enterprise
 * @param {boolean} isExit
 * @description return depot movement informations
 * @return {object} data
 */
function getDepotMovement(documentUuid, enterprise, isExit) {
  const data = {};
  const isExitValue = isExit ? 1 : 0;
  const sql = `
        SELECT
          i.code, i.text, BUID(m.document_uuid) AS document_uuid,
          m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total, m.date, m.description,
          u.display_name AS user_display_name,
          dm.text AS document_reference,
          l.label, l.expiration_date, d.text AS depot_name, dd.text as otherDepotName
        FROM
          stock_movement m
        JOIN
          lot l ON l.uuid = m.lot_uuid
        JOIN
          inventory i ON i.uuid = l.inventory_uuid
        JOIN
          depot d ON d.uuid = m.depot_uuid
        JOIN
          user u ON u.id = m.user_id
        LEFT JOIN
          depot dd ON dd.uuid = entity_uuid
        LEFT JOIN document_map dm ON dm.uuid = m.document_uuid
        WHERE
          m.is_exit = ? AND m.flux_id = ? AND m.document_uuid = ?`;

  return db.exec(sql, [
    isExitValue,
    isExit ? Stock.flux.TO_OTHER_DEPOT : Stock.flux.FROM_OTHER_DEPOT,
    db.bid(documentUuid),
  ])
    .then((rows) => {
      if (!rows.length) {
        throw new NotFound('document not found for exit');
      }
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
      };

      data.rows = rows;
      return data;
    });
}

// Extensible PDF layout options
const pdfOptions = {
  orientation : 'landscape',
  footerRight : '[page] / [toPage]',
  footerFontSize : '8',
};

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
};

// Exports
exports._ = _;

exports.db = db;

exports.Stock = Stock;
exports.ReportManager = ReportManager;
exports.NotFound = NotFound;
exports.stockFluxReceipt = stockFluxReceipt;

exports.formatFilters = formatFilters;
exports.identifiers = identifiers;
exports.getDepotMovement = getDepotMovement;

exports.pdfOptions = pdfOptions;

exports.STOCK_EXIT_PATIENT_TEMPLATE = STOCK_EXIT_PATIENT_TEMPLATE;
exports.STOCK_EXIT_SERVICE_TEMPLATE = STOCK_EXIT_SERVICE_TEMPLATE;
exports.STOCK_EXIT_DEPOT_TEMPLATE = STOCK_EXIT_DEPOT_TEMPLATE;
exports.STOCK_EXIT_LOSS_TEMPLATE = STOCK_EXIT_LOSS_TEMPLATE;

exports.STOCK_ENTRY_DEPOT_TEMPLATE = STOCK_ENTRY_DEPOT_TEMPLATE;
exports.STOCK_ENTRY_PURCHASE_TEMPLATE = STOCK_ENTRY_PURCHASE_TEMPLATE;
exports.STOCK_ENTRY_INTEGRATION_TEMPLATE = STOCK_ENTRY_INTEGRATION_TEMPLATE;
exports.STOCK_ENTRY_DONATION_TEMPLATE = STOCK_ENTRY_DONATION_TEMPLATE;
exports.STOCK_ADJUSTMENT_TEMPLATE = STOCK_ADJUSTMENT_TEMPLATE;

exports.STOCK_LOTS_REPORT_TEMPLATE = STOCK_LOTS_REPORT_TEMPLATE;
exports.STOCK_MOVEMENTS_REPORT_TEMPLATE = STOCK_MOVEMENTS_REPORT_TEMPLATE;
exports.STOCK_INVENTORY_REPORT_TEMPLATE = STOCK_INVENTORY_REPORT_TEMPLATE;
exports.STOCK_INVENTORIES_REPORT_TEMPLATE = STOCK_INVENTORIES_REPORT_TEMPLATE;
