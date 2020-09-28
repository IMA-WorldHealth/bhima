const {
  _, ReportManager, Stock, formatFilters, pdfOptions, STOCK_LOTS_REPORT_TEMPLATE,
} = require('../common');

/**
 * @method stockLotsReport
 *
 * @description
 * This method builds the stock lots report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/lots
 */
function stockLotsReport(req, res, next) {
  let options = {};
  let display = {};
  let filters;

  const data = {};
  let hasFilter = false;
  let report;

  const optionReport = _.extend(req.query, pdfOptions, {
    filename : 'TREE.STOCK_LOTS',
  });

  // set up the report with report manager
  try {
    if (req.query.identifiers && req.query.display) {
      options = JSON.parse(req.query.identifiers);
      display = JSON.parse(req.query.display);
      filters = formatFilters(display);
      hasFilter = Object.keys(display).length > 0;
    } else {
      options = req.query;
    }

    report = new ReportManager(STOCK_LOTS_REPORT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  if (options.defaultPeriod) {
    options.defaultPeriodEntry = options.defaultPeriod;
    delete options.defaultPeriod;
  }

  options.monthAverageConsumption = req.session.stock_settings.month_average_consumption;
  options.enableDailyConsumption = req.session.stock_settings.enable_daily_consumption;

  if (req.session.stock_settings.enable_strict_depot_permission) {
    options.check_user_id = req.session.user.id;
  }

  return Stock.getLotsDepot(null, options)
    .then((rows) => {
      data.rows = rows;
      data.hasFilter = hasFilter;
      data.filters = filters;
      data.csv = rows;
      data.display = display;
      data.filters = formatFilters(options);

      // group by depot
      const groupedDepots = _.groupBy(rows, d => d.depot_text);
      const depots = {};

      Object.keys(groupedDepots).sort(compare).forEach(d => {
        depots[d] = _.sortBy(groupedDepots[d], line => String(line.text).toLocaleLowerCase());
      });

      data.depots = depots;
      return report.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}

function compare(a, b) {
  return a.localeCompare(b);
}

module.exports = stockLotsReport;
