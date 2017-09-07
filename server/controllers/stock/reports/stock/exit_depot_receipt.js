const { _, ReportManager, getDepotMovement, STOCK_EXIT_DEPOT_TEMPLATE } = require('../common');

/**
 * @method stockExitDepotReceipt
 *
 * @description
 * This method builds the stock inventory report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /receipts/stock/exit_depot/:document_uuid
 */
function stockExitDepotReceipt(req, res, next) {
  let report;
  const documentUuid = req.params.document_uuid;
  const optionReport = _.extend(req.query, { filename : 'STOCK.RECEIPTS.EXIT_DEPOT' });

  // set up the report with report manager
  try {
    report = new ReportManager(STOCK_EXIT_DEPOT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  return getDepotMovement(documentUuid, req.session.enterprise, true)
    .then(data => report.render(data))
    .then(result => res.set(result.headers).send(result.report))
    .catch(next)
    .done();
}

exports.stockExitDepotReceipt = stockExitDepotReceipt;
