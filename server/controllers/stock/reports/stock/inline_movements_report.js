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
  const optionReport = _.extend(req.query, pdfOptions, {
    filename : 'TREE.STOCK_INLINE_MOVEMENTS',
    csvKey : 'rows',
    renameKeys : false,
  });

  // set up the report with report manager
  try {
    const report = new ReportManager(STOCK_INLINE_MOVEMENTS_REPORT_TEMPLATE, req.session, optionReport);

    const params = req.query;

    if (req.session.stock_settings.enable_strict_depot_permission) {
      params.check_user_id = req.session.user.id;
    }

    const rows = await Stock.getMovements(null, params);

    const data = {
      rows,
      filters : formatFilters(req.query),
    };

    const depots = _.chain(rows)
      .groupBy(d => d.depot_text)
      .mapValues(lines => _.sortBy(lines, 'depot_text'))
      .value();

    data.depots = depots;

    const result = await report.render(data);
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}

module.exports = stockInlineMovementsReport;
