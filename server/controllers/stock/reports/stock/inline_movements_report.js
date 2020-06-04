const {
  _, ReportManager, Stock, formatFilters, pdfOptions, STOCK_INLINE_MOVEMENTS_REPORT_TEMPLATE,
} = require('../common');

/**
 * @method stockInlineMovementsReport
 *
 * @description
 * This method builds the stock movements report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/inline-movements
 */
async function stockInlineMovementsReport(req, res, next) {
  let display = {};
  const optionReport = _.extend(req.query, pdfOptions, {
    filename : 'TREE.STOCK_INLINE_MOVEMENTS',
    csvKey : 'rows',
    renameKeys : false,
  });

  // set up the report with report manager
  try {
    if (req.query.displayNames) {
      display = JSON.parse(req.query.displayNames);
      delete req.query.displayNames;
    }

    const report = new ReportManager(STOCK_INLINE_MOVEMENTS_REPORT_TEMPLATE, req.session, optionReport);

    const rows = await Stock.getMovements(null, req.query);

    const data = {
      rows,
      display,
      filters : formatFilters(req.query),
    };

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

module.exports = stockInlineMovementsReport;
