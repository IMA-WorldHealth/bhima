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
 * This method builds the RUMER (Registre d’Utilisation des Médicaments Et Recettes) report
 * by month JSON, PDF, or HTML file to be sent to the client.
 *
 * GET /reports/stock/rumer_report
 */
async function report(req, res, next) {
  const params = req.query;

  params.exclude_out_stock = parseInt(params.exclude_out_stock, 10);
  params.include_daily_balances = parseInt(params.include_daily_balances, 10);
  params.condensed_report = parseInt(params.condensed_report, 10);

  const template = params.condensed_report ? TEMPLATE2 : TEMPLATE1;

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
        (sms.out_quantity_consumption + sms.out_quantity_exit) AS quantity,
        sms.in_quantity, sms.quantity_delta, sms.date
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
      // First populate the monthly stats
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
      // Add the opening balance for each inventory article
      if (inventoriesOpening.length) {
        inventoriesOpening.forEach(opening => {
          if (inventory.inventoryUuid === opening.inventory_uuid) {
            inventory.quantityOpening = opening.quantity;
          }
        });
      }

      const dailyConsumption = [];
      for (let i = startDate; i <= endDate; i++) {
        dailyConsumption.push({ index : i, consumed : 0 });
      }

      // Construct a consumed inventories data set for this inventory item
      // to simplify the logic for constructing balances.
      const invDailyConsumed = inventoriesConsumed.filter(item => item.uuid === inventory.inventoryUuid);
      invDailyConsumed.forEach(item => {
        item.dayNum = parseInt(moment(item.date).format('DD'), 10);
      });
      invDailyConsumed.sort((a, b) => a.date > b.date);
      let lastBalance = inventory.quantityOpening;
      let numStockOutDays = 0;
      dailyConsumption.forEach(d => {
        const consumed = invDailyConsumed.find(item => item.dayNum === d.index);
        if (consumed) {
          d.consumed = consumed.quantity;
          d.incoming = consumed.in_quantity;
          d.balance = lastBalance + consumed.quantity_delta;
        } else {
          d.balance = lastBalance;
        }

        // Save the balance for the next day
        lastBalance = d.balance;

        if (d.balance === 0) {
          numStockOutDays += 1;
        }
      });

      inventory.numStockOutDays = numStockOutDays;
      inventory.percentStockOut = Number(100 * (numStockOutDays / dailyConsumption.length)).toFixed(1);

      inventory.dailyConsumption = dailyConsumption;
    });

    data.configurationData = configurationData;

    if (params.exclude_out_stock) {
      data.configurationData = data.configurationData.filter(item => {
        return item.quantityEnding > 0 && ((item.quantityTotalEntry > 0 && item.quantityTotalExit > 0));
      });
    }

    const result = await reporting.render(data);
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}
