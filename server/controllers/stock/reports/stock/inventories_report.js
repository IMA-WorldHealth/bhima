const {
  _, ReportManager, Stock, formatFilters, STOCK_INVENTORIES_REPORT_TEMPLATE,
} = require('../common');

/**
 * @method stockInventoriesReport
 *
 * @description
 * This method builds the stock report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/inventories
 */
async function stockInventoriesReport(req, res, next) {
  let options = {};
  let display = {};
  let filters;
  const monthAverageConsumption = req.session.stock_settings.month_average_consumption;
  const enableDailyConsumption = req.session.stock_settings.enable_daily_consumption;

  const data = {};

  const optionReport = _.extend({}, req.query, {
    filename : 'TREE.STOCK_INVENTORY',
    title : 'TREE.STOCK_INVENTORY',
    orientation : 'landscape',
  });

  try {
    if (req.query.identifiers && req.query.display) {
      options = JSON.parse(req.query.identifiers);
      display = JSON.parse(req.query.display);
      filters = formatFilters(display);
    } else {
      options = req.query;
    }

    delete options.label;

    if (req.session.stock_settings.enable_strict_depot_permission) {
      options.check_user_id = req.session.user.id;
    }

    const report = new ReportManager(STOCK_INVENTORIES_REPORT_TEMPLATE, req.session, optionReport);
    const rows = await Stock.getInventoryQuantityAndConsumption(
      options, monthAverageConsumption, enableDailyConsumption,
    );

    data.rows = rows;
    data.filters = filters;
    data.csv = rows;
    data.display = display;

    data.dateTo = options.dateTo;

    // group by depot
    const groupedDepots = _.groupBy(rows, d => d.depot_text);
    const depots = {};

    Object.keys(groupedDepots).sort(compare).forEach(d => {
      depots[d] = _.sortBy(groupedDepots[d], line => String(line.text).toLocaleLowerCase());
    });

    data.depots = depots;

    const result = await report.render(data);
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}

function compare(a, b) {
  return a.localeCompare(b);
}

module.exports = stockInventoriesReport;
