const {
  _, ReportManager, getDepotMovement, pdf, identifiers, barcode,
  STOCK_EXIT_DEPOT_TEMPLATE, POS_STOCK_EXIT_DEPOT_TEMPLATE,
} = require('../common');

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

  let template = STOCK_EXIT_DEPOT_TEMPLATE;

  if (Boolean(Number(optionReport.posReceipt))) {
    template = POS_STOCK_EXIT_DEPOT_TEMPLATE;
    _.extend(optionReport, pdf.posReceiptOptions);
  }

  // set up the report with report manager
  try {
    report = new ReportManager(template, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  return getDepotMovement(documentUuid, req.session.enterprise, true)
    .then(data => {
      const exitKey = identifiers.STOCK_EXIT.key;
      data.exit.details.barcode = barcode.generate(exitKey, data.exit.details.document_uuid);
      return report.render(data);
    })
    .then(result => res.set(result.headers).send(result.report))
    .catch(next)
    .done();
}

module.exports = stockExitDepotReceipt;
