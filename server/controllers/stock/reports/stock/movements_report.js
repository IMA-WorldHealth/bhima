const util = require('../../../../lib/util');
const {
  _, ReportManager, Stock, formatFilters, pdfOptions, STOCK_MOVEMENTS_REPORT_TEMPLATE,
} = require('../common');

/**
 * @method stockMovementsReport
 *
 * @description
 * This method builds the stock movements report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/movements
 */
function stockMovementsReport(req, res, next) {
  let options = {};
  let display = {};
  let hasFilter = false;

  const data = {};
  let report;
  const optionReport = _.extend(req.query, pdfOptions, {
    filename : 'TREE.STOCK_MOVEMENTS',
  });

  // set up the report with report manager
  try {
    if (req.query.identifiers && req.query.display) {
      options = JSON.parse(req.query.identifiers);
      display = JSON.parse(req.query.display);
      hasFilter = Object.keys(display).length > 0;
    }

    report = new ReportManager(STOCK_MOVEMENTS_REPORT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  return Stock.getLotsMovements(null, options)
    .then((rows) => {
      data.rows = rows.map(row => {
        row.cost = util.roundDecimal(row.quantity * row.unit_cost, 3);
        return row;
      });
      data.hasFilter = hasFilter;
      data.csv = rows;
      data.display = display;
      data.filters = formatFilters(display);

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

module.exports = stockMovementsReport;
