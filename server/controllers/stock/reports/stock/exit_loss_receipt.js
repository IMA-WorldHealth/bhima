const {
  _, ReportManager, Stock, NotFound, db, barcode, pdf, identifiers,
  STOCK_EXIT_LOSS_TEMPLATE, POS_STOCK_EXIT_LOSS_TEMPLATE,
  getVoucherReferenceForStockMovement,
} = require('../common');

/**
 * @method stockExitLossReceipt
 *
 * @description
 * This method builds the stock inventory report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /receipts/stock/exit_loss/:document_uuid
 */
async function stockExitLossReceipt(documentUuid, session, options) {
  const data = {};
  const optionReport = _.extend(options, { filename : 'STOCK.REPORTS.EXIT_LOSS' });

  let template = STOCK_EXIT_LOSS_TEMPLATE;

  if (Boolean(Number(optionReport.posReceipt))) {
    template = POS_STOCK_EXIT_LOSS_TEMPLATE;
    _.extend(optionReport, pdf.posReceiptOptions);
  }

  // set up the report with report manager
  const report = new ReportManager(template, session, optionReport);

  const sql = `
    SELECT i.code, i.text, BUID(m.document_uuid) AS document_uuid,
      m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total , m.date, m.description,
      u.display_name AS user_display_name,
      dm.text AS document_reference,
      l.label, l.expiration_date, d.text AS depot_name
    FROM stock_movement m
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN depot d ON d.uuid = m.depot_uuid
    JOIN user u ON u.id = m.user_id
    JOIN document_map dm ON dm.uuid = m.document_uuid
    WHERE m.is_exit = 1 AND m.flux_id = ${Stock.flux.TO_LOSS} AND m.document_uuid = ?
  `;

  const results = await Promise.all([
    db.exec(sql, [db.bid(documentUuid)]),
    getVoucherReferenceForStockMovement(documentUuid),
  ]);

  const rows = results[0];
  const voucherReference = results[1][0] ? results[1][0].voucher_reference : null;

  if (!rows.length) {
    throw new NotFound('document not found');
  }
  const line = rows[0];
  const { key } = identifiers.STOCK_EXIT;
  data.enterprise = session.enterprise;

  data.details = {
    depot_name         : line.depot_name,
    user_display_name  : line.user_display_name,
    description        : line.description,
    date               : line.date,
    document_uuid      : line.document_uuid,
    document_reference : line.document_reference,
    barcode : barcode.generate(key, line.document_uuid),
    voucher_reference : voucherReference,
  };

  data.rows = rows;
  return report.render(data);

}

module.exports = stockExitLossReceipt;
