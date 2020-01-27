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
  let hasFilter = false;
  let filters;

  const data = {};

  // optionReports
  // const metadata = req.session;
  const optionReport = _.extend({}, req.query, {
    filename : 'TREE.STOCK_INVENTORY',
    title : 'TREE.STOCK_INVENTORY',
  });


  try {
    if (req.query.identifiers && req.query.display) {
      options = JSON.parse(req.query.identifiers);
      display = JSON.parse(req.query.display);
      hasFilter = Object.keys(display).length > 0;
      filters = formatFilters(display);
    } else {
      options = req.query;
    }

    delete options.label;

    const report = new ReportManager(STOCK_INVENTORIES_REPORT_TEMPLATE, req.session, optionReport);
    const rows = await Stock.getInventoryQuantityAndConsumption(options);

    data.rows = rows;
    data.hasFilter = hasFilter;
    data.filters = filters;
    data.csv = rows;
    data.display = display;

    data.dateTo = options.dateTo;

    // group by depot
    let depots = _.groupBy(rows, d => d.depot_text);

    // make sure that they keys are sorted in alphabetical order
    depots = _.mapValues(depots, lines => {
      _.sortBy(lines, 'depot_text');
      return lines;
    });

    data.depots = depots;

    const result = await report.render(data);
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}

module.exports = stockInventoriesReport;
