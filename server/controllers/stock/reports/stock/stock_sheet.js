const {
  _, db, ReportManager, Stock, STOCK_SHEET_REPORT_TEMPLATE,
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
  const optionReport = _.extend(req.query, {
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
      options.depot_uuid
        ? await db.one('SELECT text FROM depot WHERE uuid = ?;', [db.bid(options.depot_uuid)])
        : null,
      await Stock.getInventoryMovements(options),
    ]);

    const data = { inventory, depot };

    if (!parseInt(options.orderByCreatedAt, 10)) {
      data.rows = rows.movements.sort((x, y) => x.date - y.date);
    } else {
      // already sorted by created_at by mysql
      data.rows = rows.movements;
    }

    data.totals = rows.totals;
    data.result = rows.result;
    data.dateFrom = options.dateFrom;
    data.dateTo = options.dateTo;

    const result = await report.render(data);
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}

module.exports = stockSheetReport;
