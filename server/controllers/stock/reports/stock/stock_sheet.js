const {
  _, db, ReportManager, Stock, pdfOptions, STOCK_SHEET_REPORT_TEMPLATE,
} = require('../common');

/**
 * @method stockSheetReport
 *
 * @description
 * This method builds the stock inventory report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/inventory
 */
async function stockSheetReport(req, res, next) {
  const optionReport = _.extend(req.query, pdfOptions, {
    filename : 'REPORT.STOCK.INVENTORY_REPORT',
    csvKey : 'rows',
  });

  delete req.query.label;

  // set up the report with report manager
  try {
    const options = { ...req.query };
    const report = new ReportManager(STOCK_SHEET_REPORT_TEMPLATE, req.session, optionReport);

    const [inventory, depot, rows] = await Promise.all([
      await db.one('SELECT code, text FROM inventory WHERE uuid = ?;', [db.bid(options.inventory_uuid)]),
      await db.one('SELECT text FROM depot WHERE uuid = ?;', [db.bid(options.depot_uuid)]),
      await Stock.getInventoryMovements(options),
    ]);

    const data = { inventory, depot };

    data.rows = rows.movements;
    data.totals = rows.totals;
    data.result = rows.result;
    data.dateTo = options.dateTo;

    const result = await report.render(data);
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}

module.exports = stockSheetReport;
