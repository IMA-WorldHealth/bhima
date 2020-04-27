const {
  _, db, util, ReportManager, pdfOptions, STOCK_CONSUMPTION_GRAPTH_TEMPLATE,
} = require('../common');
const stockCore = require('../../core');
const i18n = require('../../../../lib/helpers/translate');
const chartjs = require('../../../../lib/chart');
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

    const reportType = options.reportType || 'quantity';

    const reportResult = await report.render({
      title : JSON.stringify(inventory.text || ''),
      dateFrom : options.dateFrom,
      dateTo : options.dateTo,
      depot,
      chartjs : chartjs.barChar({
        label : 'date',
        data : result,
        item : {
          uuid : 'inventory_uuid',
          name : 'inventory_name',
          value : options.reportType || 'quantity',
        },
        yAxesLabelString : i18n(options.lang)(`FORM.LABELS.${reportType.toUpperCase()}`),
        xAxesLabelString : i18n(options.lang)('FORM.LABELS.DAYS'),
        canvasId : 'stockConsumptionChart',
      }),
    });
    res.set(reportResult.headers).send(reportResult.report);
  } catch (error) {
    next(error);
  }
}


module.exports = stockConsumptionGrathReport;
