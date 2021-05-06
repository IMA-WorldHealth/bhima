const _ = require('lodash');
const moment = require('moment');

const db = require('../../../../lib/db');
const core = require('../../core');
const ReportManager = require('../../../../lib/ReportManager');

const TEMPLATE1 = './server/controllers/stock/reports/rumer.report.handlebars';
const TEMPLATE2 = './server/controllers/stock/reports/rumer_condensed.report.handlebars';

exports.report = report;

// default report parameters
const DEFAULT_PARAMS = {
  csvKey : 'rumer',
  filename : 'TREE.RUMER',
  orientation : 'landscape',
};

/**
 * @method report
 *
 * @description
 * This method builds the RUMER (Drug Usage and Recipe Register) report by month JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/rumer_report
 */
async function report(req, res, next) {
  const params = req.query;

  params.exclude_out_stock = parseInt(params.exclude_out_stock, 10);
  params.consensed_report = parseInt(params.consensed_report, 10);

  const template = params.consensed_report ? TEMPLATE2 : TEMPLATE1;

  const data = {};
  const headerReport = [];
  const configurationData = [];

  params.start_date = moment(new Date(params.start_date)).format('YYYY-MM-DD');
  params.end_date = moment(new Date(params.end_date)).format('YYYY-MM-DD');

  const startDate = parseInt(moment(params.start_date).format('DD'), 10);
  const endDate = parseInt(moment(params.end_date).format('DD'), 10);

  const lastDayPreviousMonth = moment(params.start_date).subtract(1, 'day').format('YYYY-MM-DD');

  for (let i = startDate; i <= endDate; i++) {
    headerReport.push(i);
  }

  data.params = params;
  data.header = headerReport;

  const parameterOpeningStock = {
    depot_uuid : params.depotUuid,
    dateTo : lastDayPreviousMonth,
    includeEmptyLot : 1,
  };

  const parameterEndingStock = {
    depot_uuid : params.depotUuid,
    dateTo : params.end_date,
    includeEmptyLot : 1,
  };

  _.defaults(params, DEFAULT_PARAMS);

  try {
    const reporting = new ReportManager(template, req.session, params);

    const sqlDailyConsumption = `
      SELECT BUID(sms.inventory_uuid) AS uuid, inv.code, inv.text AS inventory_text,
      (sms.out_quantity_consumption + sms.out_quantity_exit) AS quantity, sms.date
        FROM stock_movement_status AS sms
        JOIN inventory AS inv ON inv.uuid = sms.inventory_uuid
      WHERE sms.depot_uuid = ? AND sms.date >= DATE(?) AND sms.date <= DATE(?)
    `;

    const sqlMonthlyConsumption = `
      SELECT BUID(sms.inventory_uuid) AS uuid, inv.code, inv.text AS inventory_text, sms.date,
        SUM(sms.out_quantity_consumption + sms.out_quantity_exit) AS quantityTotalExit, 
        SUM(sms.in_quantity) AS quantityTotalEntry,
        SUM(sms.out_quantity_consumption) AS outQuantityConsumption,
        SUM(sms.out_quantity_exit) AS outQuantityExit
      FROM stock_movement_status AS sms
        JOIN inventory AS inv ON inv.uuid = sms.inventory_uuid
      WHERE sms.depot_uuid = ? AND sms.date >= DATE(?) AND sms.date <= DATE(?)
      GROUP BY sms.inventory_uuid;
    `;

    const [
      inventoriesOpening,
      inventoriesConsumed,
      monthlyConsumption,
      inventoriesEnding,
    ] = await Promise.all([
      core.getInventoryQuantityAndConsumption(parameterOpeningStock),
      db.exec(sqlDailyConsumption, [db.bid(params.depotUuid), params.start_date, params.end_date]),
      db.exec(sqlMonthlyConsumption, [db.bid(params.depotUuid), params.start_date, params.end_date]),
      core.getInventoryQuantityAndConsumption(parameterEndingStock),
    ]);

    inventoriesEnding.forEach(inventory => {
      configurationData.push({
        inventoryUuid : inventory.inventory_uuid,
        inventoryText : inventory.text,
        quantityOpening : 0,
        quantityTotalEntry : 0,
        quantityTotalExit : 0,
        outQuantityConsumption : 0,
        outQuantityExit : 0,
        quantityEnding : inventory.quantity,
      });
    });

    configurationData.forEach(inventory => {
      const dailyConsumption = [];
      for (let i = startDate; i <= endDate; i++) {
        dailyConsumption.push({ value : 0, index : i });
      }

      inventoriesConsumed.forEach(consumed => {
        if (inventory.inventoryUuid === consumed.uuid) {
          const dateConsumption = parseInt(moment(consumed.date).format('DD'), 10);
          dailyConsumption.forEach(d => {
            if (d.index === dateConsumption) {
              d.value = consumed.quantity;
            }
          });
        }
      });

      inventory.dailyConsumption = dailyConsumption;

      if (inventoriesOpening.length) {
        inventoriesOpening.forEach(opening => {
          if (inventory.inventoryUuid === opening.inventory_uuid) {
            inventory.quantityOpening = opening.quantity;
          }
        });
      }

      if (monthlyConsumption.length) {
        monthlyConsumption.forEach(row => {
          if (inventory.inventoryUuid === row.uuid) {
            inventory.quantityTotalExit = row.quantityTotalExit;
            inventory.quantityTotalEntry = row.quantityTotalEntry;
            inventory.outQuantityConsumption = row.outQuantityConsumption;
            inventory.outQuantityExit = row.outQuantityExit;
          }
        });
      }
    });

    data.configurationData = configurationData;

    if (params.exclude_out_stock) {
      data.configurationData = data.configurationData.filter(item => {
        return ((item.quantityOpening !== 0 && item.quantityEnding !== 0)) || (item.quantityTotalExit);
      });
    }

    const result = await reporting.render(data);
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}
