const {
  _, db, util, ReportManager, pdfOptions, STOCK_CONSUMPTION_GRAPTH_TEMPLATE,
} = require('../common');
const stockCore = require('../../core');
const i18n = require('../../../../lib/helpers/translate');

/**
   * @method stockEntryReport
   *
   * @description
   * This method builds the stock entry report as either a JSON, PDF, or HTML
   * file to be sent to the client.
   *
   * GET /reports/stock/consumption_graph
   */
async function stockConsumptionGrathReport(req, res, next) {
  try {

    const params = _.clone(req.query);

    const optionReport = _.extend(params, pdfOptions, {
      filename : 'REPORT.STOCK_CONSUMPTION_GRAPH_REPORT.TITLE',
    });

    // set up the report with report manager
    const report = new ReportManager(STOCK_CONSUMPTION_GRAPTH_TEMPLATE, req.session, optionReport);

    const inventorySql = 'SELECT text FROM inventory WHERE uuid=?';
    const depotSql = 'SELECT text FROM depot WHERE uuid=?';

    const options = req.query;

    const chart = {
      labels : [],
      data : [],
    };

    let inventory = {};
    let depot = {};

    if (options.inventory_uuid) {
      inventory = await db.one(inventorySql, db.bid(options.inventory_uuid));
    }
    if (options.depot_uuid) {
      depot = await db.one(depotSql, db.bid(options.depot_uuid));
    }

    const result = await stockCore.getDailyStockConsumption(options);

    util.dateFormatter(result, 'DD');
    result.forEach(row => {
      chart.data.push(row.quantity);
      chart.labels.push(row.date);
    });

    const reportResult = await report.render({
      labels : JSON.stringify(chart.labels),
      yAxesLabelString : JSON.stringify(i18n(options.lang)('FORM.LABELS.QUANTITY')),
      xAxesLabelString : JSON.stringify(i18n(options.lang)('FORM.LABELS.DAYS')),
      title :  JSON.stringify(inventory.text || ''),
      data : JSON.stringify(chart.data),
      dateFrom : options.dateFrom,
      dateTo : options.dateTo,
      depot,
    });
    res.set(reportResult.headers).send(reportResult.report);
  } catch (error) {
    next(error);
  }
}

module.exports = stockConsumptionGrathReport;
