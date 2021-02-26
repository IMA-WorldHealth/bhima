const {
  _, Stock, ReportManager, STOCK_MOVEMENT_REPORT_TEMPLATE,
} = require('../common');
const stockCore = require('../../core');
const i18n = require('../../../../lib/helpers/translate');
const chartjs = require('../../../../lib/chart');
const db = require('../../../../lib/db');
/**
   * @method stockEntryReport
   *
   * @description
   * This method builds the stock entry report as either a JSON, PDF, or HTML
   * file to be sent to the client.
   *
   * GET /reports/stock/movement_report
   */
async function document(req, res, next) {
  try {

    const params = _.clone(req.query);

    const optionReport = _.extend(params, {
      filename : 'REPORT.STOCK_MOVEMENT_REPORT.TITLE',
    });

    // set up the report with report manager
    const report = new ReportManager(STOCK_MOVEMENT_REPORT_TEMPLATE, req.session, optionReport);
    const options = req.query;

    params.group_by_flux = 1;

    const collection = [];
    const reportType = options.reportType || 'movement_number';
    const depot = await db.one('SELECT text FROM depot WHERE uuid = ?', db.bid(params.depot_uuid));
    const result = await stockCore.getDailyStockConsumption(params);

    result.forEach(item => {
      const line = {
        label : i18n(options.lang)(Stock.fluxLabel[item.flux_id]),
        value : item[reportType],
      };
      collection.push(line);
    });

    const data = {
      labels : collection.map(item => item.label),
      datasets : [{
        data : collection.map(item => item.value),
        backgroundColor : 'rgba(8, 84, 132, 1)',
      }],
    };

    const chartRenderOptions = {
      chart_canvas_id : 'stockMovementReportChart',
      chart_data : data,
      chart_x_axis_label : i18n(options.lang)(`FORM.LABELS.${reportType.toUpperCase()}`),
      chart_type : 'horizontalBar',
    };

    const reportResult = await report.render({
      depotText : depot.text,
      dateFrom : params.dateFrom,
      dateTo : params.dateTo,
      chartjs : chartjs.renderChart(chartRenderOptions),
    });
    res.set(reportResult.headers).send(reportResult.report);
  } catch (error) {
    next(error);
  }
}

module.exports = document;
