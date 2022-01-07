const {
  _, ReportManager, Stock, STOCK_LOST_STOCK_REPORT_TEMPLATE,
} = require('../common');

const Exchange = require('../../../finance/exchange');

/**
 * @method lostStockReport
 *
 * @description
 * This method builds the stock lots report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/lost
 */
async function lostStockReport(req, res, next) {
  const params = req.query;
  const { depotRole } = req.query;
  const { enterprise } = req.session;
  const currencyId = Number(params.currencyId);

  const enterpriseId = enterprise.id;
  const exchangeRate = await Exchange.getExchangeRate(enterpriseId, currencyId, new Date());
  const rate = exchangeRate.rate || 1;

  // set up the report with report manager
  const optionReport = _.extend(params, { filename : 'TREE.LOST_STOCK_REPORT' });
  const report = new ReportManager(STOCK_LOST_STOCK_REPORT_TEMPLATE, req.session, optionReport);

  return Stock.listLostStock(params)
    .then((rows) => {
      const data = {};
      const [key] = rows;
      data.currencyId = Number(params.currencyId);
      data.exchangeRate = rate;
      data.dateTo = params.dateTo;
      data.dateFrom = params.dateFrom;
      data.isDestDepot = null;
      data.isSrcDepot = null;
      if (key && depotRole === 'destination') {
        data.isDestDepot = true;
        data.depotName = key.destDepot;
      } else if (key && depotRole === 'source') {
        data.isSrcDepot = true;
        data.depotName = key.srcDepot;
      }
      let sumLosses = 0;
      let totalMissing = 0;
      rows.forEach(row => {
        row.unit_cost *= rate;
        totalMissing += row.quantityDifference;
        row.loss = row.quantityDifference * row.unit_cost;
        sumLosses += row.loss;
      });
      data.rows = rows;
      data.totalMissing = totalMissing;
      data.totalLoss = sumLosses;
      return report.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}

module.exports = lostStockReport;
