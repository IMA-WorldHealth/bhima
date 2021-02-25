const {
  _, util, Stock, ReportManager, STOCK_MOVEMENT_REPORT_TEMPLATE,
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

    const reportType = options.reportType || 'movement_number';
    const result = await stockCore.getDailyStockConsumption(params);

    util.dateFormatter(result, 'DD MMM YYYY');

    // flux labels
    const fluxLabels = Object.keys(Stock.fluxLabel).map(key => i18n(options.lang)(Stock.fluxLabel[key]));

    // chart labels
    const chartLabels = [
      'Total',
      ...fluxLabels,
    ];

    // data by flux
    // const dataByFlux = result.reduce((prev, curr) => {
    //   prev[Stock.fluxLabel[curr.flux_id]] = curr[reportType];
    //   return prev;
    // }, {});

    const dataByFlux = result.map(item => {
      const line = {
        label : i18n(options.lang)(Stock.fluxLabel[item.flux_id]),
        value : item[reportType],
      };
      return line;
    });

    dataByFlux.push({ label : 'Total', value : _.sumBy(result, reportType) });

    const data = {
      labels : chartLabels,
      datasets : dataByFlux,
    };

    const reportResult = await report.render({
      dateFrom : params.dateFrom,
      dateTo : params.dateTo,
      chartjs : chartjs.renderChart(
        'stockMovementReportChart',
        data,
        i18n(options.lang)(`FORM.LABELS.${reportType.toUpperCase()}`),
        i18n(options.lang)('FORM.LABELS.DAYS'),
        true,
      ),
    });
    res.set(reportResult.headers).send(reportResult.report);
  } catch (error) {
    next(error);
  }
}

module.exports = document;
