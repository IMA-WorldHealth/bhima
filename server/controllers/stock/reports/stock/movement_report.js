const {
  _, db, util, ReportManager, pdfOptions, STOCK_MOVEMENT_REPORT_TEMPLATE,
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
async function document(req, res, next) {
  try {

    const params = _.clone(req.query);

    const optionReport = _.extend(params, pdfOptions, {
      filename : 'REPORT.STOCK_MOVEMENT_REPORT.TITLE',
    });

    // set up the report with report manager
    const report = new ReportManager(STOCK_MOVEMENT_REPORT_TEMPLATE, req.session, optionReport);

    const options = req.query;

    let dateFrom = '';
    let dateTo = '';

    if (params.period_id) {
      const period = await db.one('SELECT start_date,end_date FROM period WHERE id=?', params.period_id);
      dateFrom = period.start_date;
      dateTo = period.end_date;
    }
    const result = await stockCore.getDailyStockConsumption(params);

    util.dateFormatter(result, 'DD');

    const reportType = options.reportType || 'movement_number';

    const reportResult = await report.render({
      dateFrom,
      dateTo,
      chartjs : chartjs.barChart({
        label : 'date',
        data : result,
        uniqueColor : true,
        item : {
          uuid : 'date',
          name : 'date',
          value : reportType,
        },
        yAxesLabelString : i18n(options.lang)(`FORM.LABELS.${reportType.toUpperCase()}`),
        xAxesLabelString : i18n(options.lang)('FORM.LABELS.DAYS'),
        canvasId : 'stockMovementReportChart',
      }),
    });
    res.set(reportResult.headers).send(reportResult.report);
  } catch (error) {
    next(error);
  }
}

module.exports = document;
