const {
  _, ReportManager, Stock, NotFound, db, identifiers, barcode, STOCK_ADJUSTMENT_TEMPLATE,
  getVoucherReferenceForStockMovement,
} = require('../common');


/**
 * @method stockAdjustmentReceipt
 *
 * @description
 * This method builds the stock adjustment receipt file to be sent to the client.
 */
async function stockAdjustmentReceipt(documentUuid, session, options) {
  const optionReport = _.extend(options, { filename : 'STOCK.REPORTS.ADJUSTMENT' });

  // set up the report with report manager
  const report = new ReportManager(STOCK_ADJUSTMENT_TEMPLATE, session, optionReport);
  const sql = `
    SELECT i.code, i.text, BUID(m.document_uuid) AS document_uuid, m.is_exit,
      m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total , m.date, m.description,
      u.display_name AS user_display_name, dm.text AS document_reference,
      l.label, l.expiration_date, d.text AS depot_name
    FROM stock_movement m
    JOIN document_map dm ON dm.uuid = m.document_uuid
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN depot d ON d.uuid = m.depot_uuid
    JOIN user u ON u.id = m.user_id
    WHERE m.flux_id IN (${Stock.flux.FROM_ADJUSTMENT}, ${Stock.flux.TO_ADJUSTMENT}) AND m.document_uuid = ?
  `;

  const [rows, [references]] = await Promise.all([
    db.exec(sql, [db.bid(documentUuid)]),
    getVoucherReferenceForStockMovement(documentUuid),
  ]);

  const voucherReference = references && references.voucher_reference;

  if (!rows.length) {
    throw new NotFound(`Could not find document with uuid: ${documentUuid}`);
  }

  const line = rows[0];
  const { key } = identifiers.STOCK_MOVEMENT;
  const data = {};
  data.enterprise = session.enterprise;

  data.details = {
    title              : line.is_exit ? 'STOCK_FLUX.TO_ADJUSTMENT' : 'STOCK_FLUX.FROM_ADJUSTMENT',
    is_exit            : line.is_exit,
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

module.exports = stockAdjustmentReceipt;
