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
function stockExitDepotReceipt(documentUuid, session, options) {
  const optionReport = _.extend(options, { filename : 'STOCK.RECEIPTS.EXIT_DEPOT' });
  let template = STOCK_EXIT_DEPOT_TEMPLATE;

  if (Boolean(Number(optionReport.posReceipt))) {
    template = POS_STOCK_EXIT_DEPOT_TEMPLATE;
    _.extend(optionReport, pdf.posReceiptOptions);
  }

  // set up the report with report manager
  const report = new ReportManager(template, session, optionReport);

  return getDepotMovement(documentUuid, session.enterprise, true)
    .then(data => {
      const { key } = identifiers.STOCK_EXIT;

      // get the total cost of the movement
      data.totals = { cost : data.rows.reduce((agg, row) => agg + row.total, 0) };

      data.exit.details.barcode = barcode.generate(key, data.exit.details.document_uuid);
      return report.render(data);
    });
}

module.exports = stockExitDepotReceipt;
