const {
  _, ReportManager, getDepotMovement, barcode, identifiers, STOCK_ENTRY_DEPOT_TEMPLATE,
} = require('../common');

/**
 * @method stockEntryDepotReceipt
 *
 * @description
 * This method builds the stock inventory report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /receipts/stock/entry_depot/:document_uuid
 */
function stockEntryDepotReceipt(documentUuid, session, options) {
  const optionReport = _.extend(options, { filename : 'STOCK.RECEIPTS.ENTRY_DEPOT' });

  // set up the report with report manager
  const report = new ReportManager(STOCK_ENTRY_DEPOT_TEMPLATE, session, optionReport);

  return getDepotMovement(documentUuid, session.enterprise, false)
    .then(data => {
      const { key } = identifiers.STOCK_ENTRY;
      data.totals = { cost : data.rows.reduce((agg, row) => agg + row.total, 0) };
      data.entry.details.barcode = barcode.generate(key, data.entry.details.document_uuid);
      return report.render(data);
    });
}

module.exports = stockEntryDepotReceipt;
