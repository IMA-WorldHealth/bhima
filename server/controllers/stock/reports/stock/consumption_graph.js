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

    const depotSql = 'SELECT text FROM depot WHERE uuid=?';
    const options = req.query;
    let depot = {};

    if (options.depot_uuid) {
      depot = await db.one(depotSql, db.bid(options.depot_uuid));
    }
    let dateFrom = '';
    let dateTo = '';

    if (params.period_id) {
      const period = await db.one('SELECT start_date,end_date FROM period WHERE id=?', params.period_id);
      dateFrom = period.start_date;
      dateTo = period.end_date;
    }
    const result = await stockCore.getDailyStockConsumption(options);
    util.dateFormatter(result, 'DD');

    const reportType = options.reportType || 'quantity';

    const reportResult = await report.render({
      dateFrom,
      dateTo,
      depot,
      chartjs : chartjs.barChart({
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
