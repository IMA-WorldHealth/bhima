const { _, ReportManager, Stock, formatFilters, STOCK_INVENTORIES_REPORT_TEMPLATE } = require('../common');

/**
 * @method stockInventoriesReport
 *
 * @description
 * This method builds the stock report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/inventories
 */
function stockInventoriesReport(req, res, next) {
  let options = {};
  let display = {};
  let hasFilter = false;
  let report;
  let filters;

  const data = {};
  const bundle = {};

  const optionReport = _.extend(req.query, {
    filename : 'TREE.STOCK_INVENTORY',
    orientation : 'landscape',
    footerRight : '[page] / [toPage]',
    footerFontSize : '8',
  });

  // set up the report with report manager
  try {
    if (req.query.identifiers && req.query.display) {
      options = JSON.parse(req.query.identifiers);
      display = JSON.parse(req.query.display);
      hasFilter = Object.keys(display).length > 0;
      filters = formatFilters(display);
    } else if (req.query.params) {
      options = JSON.parse(req.query.params);
      bundle.delay = options.inventory_delay;
      bundle.purchaseInterval = options.purchase_interval;
    }

    report = new ReportManager(STOCK_INVENTORIES_REPORT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  return Stock.getInventoryQuantityAndConsumption(options)
    .then((rows) => {
      data.rows = rows;
      data.hasFilter = hasFilter;
      data.filters = filters;
      data.csv = rows;
      data.display = display;

      data.dateTo = options.dateTo;
      data.delay = bundle.delay || 1;
      data.purchaseInterval = bundle.purchaseInterval || 1;

      // group by depot
      let depots = _.groupBy(rows, d => d.depot_text);

      // make sure that they keys are sorted in alphabetical order
      depots = _.mapValues(depots, lines => {
        _.sortBy(lines, 'depot_text');
        return lines;
      });

      data.depots = depots;
      return report.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

exports.stockInventoriesReport = stockInventoriesReport;
