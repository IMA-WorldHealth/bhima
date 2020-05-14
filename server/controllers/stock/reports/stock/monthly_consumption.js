const _ = require('lodash');
const q = require('q');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');

const TEMPLATE = './server/controllers/stock/reports/monthly_consumption.report.handlebars';

exports.report = report;

// default report parameters
const DEFAULT_PARAMS = {
  csvKey : 'monthlyConsumption',
  filename : 'TREE.MONTHLY_CONSUMPTION',
  orientation : 'portrait',
};

/**
 * @method report
 *
 * @description
 * This method builds the consumption report by month JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/monthly_consumption
 */
async function report(req, res, next) {
  const params = req.query;
  const data = {};

  let reporting;
  data.params = params;

  _.defaults(params, DEFAULT_PARAMS);

  try {
    reporting = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    next(e);
    return;
  }

  const sql = `
    SELECT BUID(sc.inventory_uuid) AS inventory_uuid, iv.text, p.translate_key, MONTH(p.start_date) AS month_key,
    f.label AS fiscal_year, sc.quantity, d.text AS depot
    FROM stock_consumption AS sc
    JOIN inventory AS iv ON iv.uuid = sc.inventory_uuid
    JOIN period AS p ON p.id = sc.period_id
    JOIN fiscal_year AS f ON f.id = p.fiscal_year_id
    JOIN depot AS d ON d.uuid = sc.depot_uuid
    WHERE sc.period_id >= ? AND sc.period_id <= ? AND d.uuid = ? ORDER BY iv.text ASC;
  `;

  const sqlAggregat = `
    SELECT DISTINCT(BUID(sc.inventory_uuid)) AS inventory_uuid, iv.text AS inventory_text
    FROM stock_consumption AS sc
    JOIN inventory AS iv ON iv.uuid = sc.inventory_uuid
    WHERE sc.period_id >= ? AND sc.period_id <= ? AND sc.depot_uuid = ?
    ORDER BY iv.text ASC;
  `;

  const sqlGetPeriod = `
    SELECT p.translate_key, p.id, MONTH(p.start_date) AS month_key, f.label AS fiscal_year
    FROM period AS p
    JOIN fiscal_year AS f ON f.id = p.fiscal_year_id
    WHERE p.id >= ? AND p.id <= ? AND p.number <> 0;
  `;

  const dbPromises = [
    db.exec(sql, [params.periodFrom, params.periodTo, db.bid(params.depotUuid)]),
    db.exec(sqlAggregat, [params.periodFrom, params.periodTo, db.bid(params.depotUuid)]),
    db.exec(sqlGetPeriod, [params.periodFrom, params.periodTo]),
  ];

  q.all(dbPromises)
    .spread((stockConsumption, inventories, periods) => {
      data.periods = periods;

      data.fiscalYear = periods[0].fiscal_year;
      data.depot = params.depot_text;
      data.inventories = inventories;

      data.spanColumn = data.periods.length + 3;

      if (inventories.length > 0) {
        data.inventories.forEach(item => {
          item.monthlyConsumption = [];
          item.total = 0;
          periods.forEach(period => {
            let quantityValue = 0;
            stockConsumption.forEach(stock => {
              if (item.inventory_uuid === stock.inventory_uuid) {
                if (period.month_key === stock.month_key) {
                  quantityValue = stock.quantity;
                  item.total += stock.quantity;
                }
              }
            });
            item.monthlyConsumption.push({ quantity : quantityValue });
          });
        });
      }

      return reporting.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}
