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
  const is_exit = isExit ? 1 : 0;
  const sql = `
        SELECT
          i.code, i.text, BUID(m.document_uuid) AS document_uuid,
          m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total, m.date, m.description,
          u.display_name AS user_display_name,
          CONCAT_WS('.', '${identifiers.DOCUMENT.key}', m.reference) AS document_reference,
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
        WHERE
          m.is_exit = ? AND m.flux_id = ? AND m.document_uuid = ?`;

  return db.exec(sql, [is_exit, isExit ? Stock.flux.TO_OTHER_DEPOT : Stock.flux.FROM_OTHER_DEPOT, db.bid(documentUuid)])
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
      return data ;
    });
}

// Exports
exports._ = _;

exports.db = db;

exports.Stock = Stock;
exports.ReportManager = ReportManager;
exports.NotFound = NotFound;

exports.formatFilters = formatFilters;
exports.identifiers = identifiers;
exports.getDepotMovement = getDepotMovement;

exports.STOCK_EXIT_PATIENT_TEMPLATE = STOCK_EXIT_PATIENT_TEMPLATE;
exports.STOCK_EXIT_SERVICE_TEMPLATE = STOCK_EXIT_SERVICE_TEMPLATE;
exports.STOCK_EXIT_DEPOT_TEMPLATE = STOCK_EXIT_DEPOT_TEMPLATE;
exports.STOCK_EXIT_LOSS_TEMPLATE = STOCK_EXIT_LOSS_TEMPLATE;

exports.STOCK_ENTRY_DEPOT_TEMPLATE = STOCK_ENTRY_DEPOT_TEMPLATE;
exports.STOCK_ENTRY_PURCHASE_TEMPLATE = STOCK_ENTRY_PURCHASE_TEMPLATE;
exports.STOCK_ENTRY_INTEGRATION_TEMPLATE = STOCK_ENTRY_INTEGRATION_TEMPLATE;
exports.STOCK_ADJUSTMENT_TEMPLATE = STOCK_ADJUSTMENT_TEMPLATE;

exports.STOCK_LOTS_REPORT_TEMPLATE = STOCK_LOTS_REPORT_TEMPLATE;
exports.STOCK_MOVEMENTS_REPORT_TEMPLATE = STOCK_MOVEMENTS_REPORT_TEMPLATE;
exports.STOCK_INVENTORY_REPORT_TEMPLATE = STOCK_INVENTORY_REPORT_TEMPLATE;
exports.STOCK_INVENTORIES_REPORT_TEMPLATE = STOCK_INVENTORIES_REPORT_TEMPLATE;
