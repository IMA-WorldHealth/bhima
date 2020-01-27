const {
  _, ReportManager, NotFound, Stock, db, identifiers, pdf, barcode,
  STOCK_EXIT_PATIENT_TEMPLATE, POS_STOCK_EXIT_PATIENT_TEMPLATE,
  getVoucherReferenceForStockMovement,
} = require('../common');

/**
 * @method stockExitPatientReceipt
 *
 * @description
 * This method builds the stock exit to patient receipt
 * file to be sent to the client.
 *
 * GET /receipts/stock/exit_patient/:document_uuid
 */
async function stockExitPatientReceipt(documentUuid, session, options) {
  const data = {};
  const optionReport = _.extend(options, { filename : 'STOCK.REPORTS.EXIT_PATIENT' });

  let template = STOCK_EXIT_PATIENT_TEMPLATE;

  if (Boolean(Number(optionReport.posReceipt))) {
    template = POS_STOCK_EXIT_PATIENT_TEMPLATE;
    _.extend(optionReport, pdf.posReceiptOptions);
  }

  // set up the report with report manager
  const report = new ReportManager(template, session, optionReport);

  const sql = `
    SELECT i.code, i.text, BUID(m.document_uuid) AS document_uuid,
      m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total , m.date, m.description,
      u.display_name AS user_display_name, p.display_name AS patient_display_name,
      dm.text AS document_reference,
      CONCAT_WS('.', '${identifiers.PATIENT.key}', proj.abbr, p.reference) AS patient_reference, p.hospital_no,
      l.label, l.expiration_date, d.text AS depot_name
    FROM stock_movement m
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN depot d ON d.uuid = m.depot_uuid
    JOIN patient p ON p.uuid = m.entity_uuid
    JOIN project proj ON proj.id = p.project_id
    JOIN user u ON u.id = m.user_id
    JOIN document_map dm ON dm.uuid = m.document_uuid
    WHERE m.is_exit = 1 AND m.flux_id = ${Stock.flux.TO_PATIENT} AND m.document_uuid = ?
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
  const { key } = identifiers.STOCK_EXIT;
  data.enterprise = session.enterprise;

  data.details = {
    depot_name           : line.depot_name,
    patient_reference    : line.patient_reference,
    patient_display_name : line.patient_display_name,
    full_display_name    : line.patient_reference.concat(' - ', line.patient_display_name),
    hospital_no          : line.hospital_no,
    user_display_name    : line.user_display_name,
    description          : line.description,
    date                 : line.date,
    document_uuid        : line.document_uuid,
    document_reference   : line.document_reference,
    barcode : barcode.generate(key, line.document_uuid),
    voucher_reference : voucherReference,
  };

  data.rows = rows;
  return report.render(data);
}

module.exports = stockExitPatientReceipt;
