const Exchange = require('../../../finance/exchange');

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
  reporting(req.query, req.session).then(result => {
    res.set(result.headers).send(result.report);
  }).catch(next);
}

async function reporting(_options, session) {

  const data = {};
  const enterpriseId = session.enterprise.id;

  const optionReport = _.extend(_options, pdfOptions, {
    filename : 'TREE.STOCK_VALUE',
  });

  const report = new ReportManager(STOCK_VALUE_REPORT_TEMPLATE, session, optionReport);

  const options = (typeof (_options.params) === 'string') ? JSON.parse(_options.params) : _options.params;
  data.dateTo = options.dateTo;
  data.depot = await db.one('SELECT * FROM depot WHERE uuid=?', [db.bid(options.depot_uuid)]);
  const stockValues = await db.exec('CALL stockValue(?,?,?);', [
    db.bid(options.depot_uuid), options.dateTo, options.currency_id,
  ]);

  const stockValueElements = options.exclude_zero_value
    ? stockValues[0].filter(item => item.stockValue > 0) : stockValues[0];

  data.stockValues = stockValueElements || [];
  const stokTolal = stockValues[1][0] || {};
  data.stocktotal = stokTolal.total;
  data.emptyResult = data.stockValues.length === 0;
  data.rate = Exchange.getExchangeRate(enterpriseId, options.currency_id, new Date());
  data.currency_id = options.currency_id;
  return report.render(data);
}

module.exports.document = stockValue;
module.exports.reporting = reporting;
