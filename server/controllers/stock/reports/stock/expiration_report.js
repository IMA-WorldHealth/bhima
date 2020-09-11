const {
  _, db, ReportManager, pdfOptions, STOCK_EXPIRATION_REPORT_TEMPLATE,
} = require('../common');
const stockCore = require('../../core');
/**
   * @method stockEntryReport
   *
   * @description
   * This method builds the stock entry report as either a JSON, PDF, or HTML
   * file to be sent to the client.
   *
   * GET /reports/stock/consumption_graph
   */
async function stockExpirationReport(req, res, next) {
  try {

    const params = _.clone(req.query);

    const optionReport = _.extend(params, pdfOptions, {
      filename : 'REPORT.STOCK_CONSUMPTION_GRAPH_REPORT.TITLE',
    });

    // set up the report with report manager
    const report = new ReportManager(STOCK_EXPIRATION_REPORT_TEMPLATE, req.session, optionReport);

    const depotSql = 'SELECT text FROM depot WHERE uuid=?';
    const options = req.query;
    options.user = req.session.user;

    let depot = {};

    if (options.depot_uuid) {
      depot = await db.one(depotSql, db.bid(options.depot_uuid));
    }

    const dateFrom = new Date(options.dateFrom);
    const dateTo = new Date(options.dateTo);

    const lots = await stockCore.getLotsDepot(options.depot_uuid, options);

    const resultByDepot = _.groupBy(lots, 'depot_uuid');
    const depotUuids = Object.keys(resultByDepot);
    const result = {};
    depotUuids.forEach(depotUuid => {
      const depotLots = resultByDepot[depotUuid].filter(row => {
        let found = false;
        if (row.status === 'stock_out') {
          row.status = `STOCK.STATUS.${row.status.toUpperCase()}`;
          row.color = 'red';
          found = true;
        } else if (row.IS_IN_RISK_EXPIRATION) {
          row.status = `STOCK.STATUS.IS_IN_RISK_OF_EXPIRATION`;
          row.color = '#f5cb42';
          found = true;
        }
        return found;
      });

      if (depotLots.length > 0) { // there are lots in this depot
        let total = 0;
        depotLots.forEach(lot => {
          lot.value = lot.mvt_quantity * lot.unit_cost;
          total += lot.value;
        });

        result[depotUuid] = {
          rows : depotLots,
          total,
          depot_name : depotLots[0].depot_text,
        };
      }
    });

    const reportResult = await report.render({
      dateFrom,
      dateTo,
      depot,
      result,
    });
    res.set(reportResult.headers).send(reportResult.report);
  } catch (error) {
    next(error);
  }
}

module.exports = stockExpirationReport;
