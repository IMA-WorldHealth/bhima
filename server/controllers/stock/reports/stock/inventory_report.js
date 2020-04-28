const {
  _, db, ReportManager, Stock, pdfOptions, STOCK_INVENTORY_REPORT_TEMPLATE,
} = require('../common');

const shared = require('../../../finance/shared');

/**
 * @method stockInventoryReport
 *
 * @description
 * This method builds the stock inventory report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/inventory
 */
async function stockInventoryReport(req, res, next) {
  const optionReport = _.extend(req.query, pdfOptions, {
    filename : 'TREE.STOCK_INVENTORY_REPORT',
  });

  const filters = shared.formatFilters(req.query);

  // set up the report with report manager
  try {
    const options = req.query.params ? JSON.parse(req.query.params) : {};
    const report = new ReportManager(STOCK_INVENTORY_REPORT_TEMPLATE, req.session, optionReport);

    const [inventory, depot, rows] = await Promise.all([
      await db.one('SELECT code, text FROM inventory WHERE uuid = ?;', [db.bid(options.inventory_uuid)]),
      await db.one('SELECT text FROM depot WHERE uuid = ?;', [db.bid(options.depot_uuid)]),
      await Stock.getInventoryMovements(options),
    ]);

    const data = { filters, inventory, depot };

    data.rows = rows.movements;
    data.totals = rows.totals;
    data.result = rows.result;
    data.csv = rows.movements;
    data.dateTo = options.dateTo;

    const result = await report.render(data);
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}

module.exports = stockInventoryReport;
