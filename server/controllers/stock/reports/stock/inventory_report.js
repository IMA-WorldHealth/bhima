const { _, db, ReportManager, Stock, STOCK_INVENTORY_REPORT_TEMPLATE } = require('../common');

/**
 * @method stockInventoryReport
 *
 * @description
 * This method builds the stock inventory report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/inventory
 */
function stockInventoryReport(req, res, next) {
  const data = {};
  let options;
  let report;

  const optionReport = _.extend(req.query, {
    filename : 'TREE.STOCK_INVENTORY_REPORT',
    orientation : 'landscape',
    footerRight : '[page] / [toPage]',
    footerFontSize : '8',
  });

  // set up the report with report manager
  try {
    options = req.query.params ? JSON.parse(req.query.params) : {};
    report = new ReportManager(STOCK_INVENTORY_REPORT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  return db.one('SELECT code, text FROM inventory WHERE uuid = ?;', [db.bid(options.inventory_uuid)])
    .then((inventory) => {
      data.inventory = inventory;

      return db.one('SELECT text FROM depot WHERE uuid = ?;', [db.bid(options.depot_uuid)]);
    })
    .then((depot) => {
      data.depot = depot;

      return Stock.getInventoryMovements(options);
    })
    .then((rows) => {
      data.rows = rows.movements;
      data.totals = rows.totals;
      data.result = rows.result;
      data.csv = rows.movements;
      data.dateTo = options.dateTo;

      return report.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

exports.stockInventoyReport = stockInventoriesReport;
