const { _, ReportManager, Stock, formatFilters, STOCK_LOTS_REPORT_TEMPLATE } = require('../common');

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
  let hasFilter = false;

  const data = {};
  let report;

  const optionReport = _.extend(req.query, {
    filename : 'TREE.STOCK_LOTS',
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
    }

    report = new ReportManager(STOCK_LOTS_REPORT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  if (options.defaultPeriod) {
    options.defaultPeriodEntry = options.defaultPeriod;
    delete options.defaultPeriod;
  }


  return Stock.getLotsDepot(null, options)
    .then((rows) => {
      data.rows = rows;
      data.hasFilter = hasFilter;
      data.csv = rows;
      data.display = display;
      data.filters = formatFilters(options);

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

exports.stockLotsReport = stockLotsReport;
