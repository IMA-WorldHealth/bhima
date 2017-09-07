const { _, ReportManager, getDepotMovement, STOCK_ENTRY_DEPOT_TEMPLATE } = require('../common');

/**
 * @method stockEntryDepotReceipt
 *
 * @description
 * This method builds the stock inventory report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /receipts/stock/entry_depot/:document_uuid
 */
function stockEntryDepotReceipt(req, res, next) {
  let report;
  const documentUuid = req.params.document_uuid;
  const optionReport = _.extend(req.query, { filename : 'STOCK.RECEIPTS.ENTRY_DEPOT' });

  // set up the report with report manager
  try {
    report = new ReportManager(STOCK_ENTRY_DEPOT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  return getDepotMovement(documentUuid, req.session.enterprise, false)
    .then(data => report.render(data))
    .then(result => res.set(result.headers).send(result.report))
    .catch(next)
    .done();
}

exports.stockEntryDepotReceipt = stockEntryDepotReceipt;
