const {
  _, db, ReportManager, pdfOptions, STOCK_VALUE_REPORT_TEMPLATE,
} = require('../common');

/**
 * @method stockInventoryReport
 *
 * @description
 * This method builds the stock value report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/value
 */
function stockValue(req, res, next) {
  const data = {};
  let options;
  let report;

  const optionReport = _.extend(req.query, pdfOptions, {
    filename : 'TREE.STOCK_VALUE',
  });

  // set up the report with report manager
  try {
    options = req.query.params ? JSON.parse(req.query.params) : {};
    report = new ReportManager(STOCK_VALUE_REPORT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }
  data.dateTo = options.dateTo;
  return db.one('SELECT * FROM depot WHERE uuid=?', [db.bid(options.depot_uuid)]).then(depot => {
    data.depot = depot;
    return db.exec('CALL stockValue(?, ?);', [db.bid(options.depot_uuid), options.dateTo]);
  })
    .then((stockValues) => {
      data.stockValues = stockValues[0] || [];

      const stokTolal = stockValues[1][0] || {};
      data.stocktotal = stokTolal.total;
      data.emptyResult = data.stockValues.length === 0;
      return report.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

module.exports = stockValue;
