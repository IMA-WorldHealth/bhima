const {
  _, ReportManager, Stock, NotFound, db, barcode, identifiers, STOCK_ENTRY_DONATION_TEMPLATE,
  getVoucherReferenceForStockMovement,
} = require('../common');

/**
 * @method stockEntryDonationReceipt
 *
 * @description
 * This method builds the stock inventory report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 */
async function stockEntryDonationReceipt(documentUuid, session, options) {
  const data = {};
  const optionReport = _.extend(options, { filename : 'STOCK.RECEIPTS.ENTRY_DONATION' });

  // set up the report with report manager
  const report = new ReportManager(STOCK_ENTRY_DONATION_TEMPLATE, session, optionReport);

  /**
   * TODO consider the donor also in a donation transaction
   *
   * This implementation doesn't handle donor informations
   */
  const sql = `
    SELECT i.code, i.text, BUID(m.document_uuid) AS document_uuid,
      m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total , m.date, m.description,
      u.display_name AS user_display_name,
      l.label, l.expiration_date, d.text AS depot_name,
      dm.text as document_reference
    FROM stock_movement m
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN depot d ON d.uuid = m.depot_uuid
    JOIN user u ON u.id = m.user_id
    LEFT JOIN document_map dm ON dm.uuid = m.document_uuid
    WHERE m.is_exit = 0 AND m.flux_id = ${Stock.flux.FROM_DONATION} AND m.document_uuid = ?
    ORDER BY i.text, l.label
  `;

  const results = await Promise.all([
    db.exec(sql, [db.bid(documentUuid)]),
    getVoucherReferenceForStockMovement(documentUuid),
  ]);

  const rows = results[0];
  const voucherReference = results[1][0].voucher_reference;

  if (!rows.length) {
    throw new NotFound('document not found');
  }
  const line = rows[0];
  const { key } = identifiers.STOCK_ENTRY;

  data.enterprise = session.enterprise;

  data.details = {
    depot_name            : line.depot_name,
    user_display_name     : line.user_display_name,
    description           : line.description,
    date                  : line.date,
    document_uuid         : line.document_uuid,
    document_reference    : line.document_reference,
    barcode               : barcode.generate(key, line.document_uuid),
    voucher_reference     : voucherReference,
  };

  data.rows = rows;

  // sum elements of rows by their `total` property
  data.total = data.rows.reduce((aggregate, row) => {
    return row.total + aggregate;
  }, 0);

  return report.render(data);

}

module.exports = stockEntryDonationReceipt;
