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


const _ = require('lodash');

const ReportManager = require('../../../lib/ReportManager');
const Stock = require('../core');

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

exports._ = _;

exports.Stock = Stock;
exports.ReportManager = ReportManager;

exports.formatFilters = formatFilters;
