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
      data.rows = combineByLots(data.rows);
      const { key } = identifiers.STOCK_ENTRY;
      data.totals = { cost : data.rows.reduce((agg, row) => agg + row.total, 0) };
      data.entry.details.barcode = barcode.generate(key, data.entry.details.document_uuid);
      return report.render(data);
    });
}

function combineByLots(rows) {
  const data = _.orderBy(rows, 'date');
  const lots = _.groupBy(data, 'lot_uuid');
  return _.keys(lots).map(key => {
    return (lots[key] || []).reduce((prev, curr) => {
      curr.total_quantity = curr.quantity + prev.total_quantity;
      curr.quantity_difference = curr.quantity_sent - curr.total_quantity;
      curr.total = curr.total_quantity * curr.unit_cost;
      return curr;
    }, { total_quantity : 0 });
  });
}

module.exports = stockEntryDepotReceipt;
