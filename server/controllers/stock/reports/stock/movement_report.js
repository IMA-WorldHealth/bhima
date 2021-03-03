const {
  _, Stock, ReportManager, STOCK_MOVEMENT_REPORT_TEMPLATE,
} = require('../common');
const stockCore = require('../../core');
const i18n = require('../../../../lib/helpers/translate');
const financeParser = require('../../../../lib/template/helpers/finance');
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
    params.order_by_exit = 1;

    const collection = [];
    const reportType = options.reportType || 'movement_count';
    const depot = await db.one('SELECT text FROM depot WHERE uuid = ?', db.bid(params.depot_uuid));
    const result = await stockCore.getDailyStockConsumption(params);

    const resultByFlux = _.groupBy(result, 'flux_id');

    Object.keys(resultByFlux).forEach(key => {
      const [first] = resultByFlux[key];
      const line = {
        label : i18n(options.lang)(Stock.fluxLabel[key]),
        value : reportType === 'movement_count' ? resultByFlux[key].length : _.sumBy(resultByFlux[key], reportType),
        isExit : !!first.is_exit,
      };
      collection.push(line);
    });

    const data = {
      labels : collection.map(item => item.label),
      datasets : [{
        data : collection.map(item => item.value),
        backgroundColor : collection.map(item => (item.isExit ? 'rgba(255, 0, 0, 1)' : 'rgba(8, 84, 132, 1)')),
      }],
    };

    const chartOption = {
      legend : {
        position : 'bottom',
        display : false,
      },
      plugins : {
        datalabels : {
          align : 'end',
          anchor : 'end',
          color() {
            return 'rgb(0, 0, 0)';
          },
          font(context) {
            const w = context.chart.width;
            return {
              size : w < 512 ? 12 : 14,
            };
          },
          formatter(value) {
            return (reportType === 'value')
              ? financeParser.currency(value, req.session.enterprise.currency_id) : value;
          },
        },
        tooltip : {
          callbacks : {
            label(context) {
              let label = context.dataset.label || '';

              if (label) {
                label += ' : ';
              }

              if (context.parsed.x !== null) {
                label += financeParser.currency(context.parsed.x, req.session.enterprise.currency_id);
              }

              return label;
            },
          },
        },
      },
    };

    const chartLegend = [
      { color : 'rgba(255, 0, 0, 1)', text : i18n(options.lang)('STOCK.EXIT') },
      { color : 'rgba(8, 84, 132, 1)', text : i18n(options.lang)('STOCK.ENTRY') },
    ];

    const chartRenderOptions = {
      chart_canvas_id : 'stockMovementReportChart',
      chart_data : data,
      chart_x_axis_label : i18n(options.lang)(`FORM.LABELS.${reportType.toUpperCase()}`),
      chart_type : 'horizontalBar',
      chart_option : chartOption,
    };

    const reportResult = await report.render({
      depotText : depot.text,
      dateFrom : params.dateFrom,
      dateTo : params.dateTo,
      chartjs : chartjs.renderChart(chartRenderOptions),
      chartLegend,
    });
    res.set(reportResult.headers).send(reportResult.report);
  } catch (error) {
    next(error);
  }
}

module.exports = document;
