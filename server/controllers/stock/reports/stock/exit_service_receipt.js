const {
  _, ReportManager, Stock, db, barcode, NotFound, pdf, identifiers,
  STOCK_EXIT_SERVICE_TEMPLATE, POS_STOCK_EXIT_SERVICE_TEMPLATE,
} = require('../common');

/**
 * @method stockExitServiceReceipt
 *
 * @description
 * This method builds the stock inventory report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 */
function stockExitServiceReceipt(documentUuid, session, options) {
  const data = {};
  const optionReport = _.extend(options, { filename : 'STOCK.REPORTS.EXIT_SERVICE' });

  let template = STOCK_EXIT_SERVICE_TEMPLATE;

  if (Boolean(Number(optionReport.posReceipt))) {
    template = POS_STOCK_EXIT_SERVICE_TEMPLATE;
    _.extend(optionReport, pdf.posReceiptOptions);
    // provide barcode string to be rendered by client/ receipts
    const entityIdentifier = identifiers.STOCK_EXIT.key;
    const barcodeString = barcode.generate(entityIdentifier, documentUuid);
    data.barcode = barcodeString;
  }

  // set up the report with report manager
  const report = new ReportManager(template, session, optionReport);

  const sql = `
    SELECT i.code, i.text, iu.text AS unit, BUID(m.document_uuid) AS document_uuid,
      m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total , m.date, m.description,
      u.display_name AS user_display_name, s.name AS service_display_name,
      dm.text AS document_reference,
      l.label, l.expiration_date, d.text AS depot_name,
      BUID(sr.uuid) AS stock_requisition_uuid, sr_m.text AS document_requisition
    FROM stock_movement m
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN inventory_unit iu ON iu.id = i.unit_id
    JOIN depot d ON d.uuid = m.depot_uuid
    JOIN service s ON s.uuid = m.entity_uuid
    JOIN user u ON u.id = m.user_id
    LEFT JOIN document_map dm ON dm.uuid = m.document_uuid
    LEFT JOIN stock_requisition_movement smr ON smr.document_uuid = m.document_uuid
    LEFT JOIN stock_requisition sr ON sr.uuid = smr.stock_requisition_uuid
    LEFT JOIN document_map sr_m ON sr_m.uuid = sr.uuid
    WHERE m.is_exit = 1 AND m.flux_id = ${Stock.flux.TO_SERVICE} AND m.document_uuid = ?
  `;

  return db.exec(sql, [db.bid(documentUuid)])
    .then((rows) => {
      if (!rows.length) {
        throw new NotFound('document not found');
      }
      const line = rows[0];
      const { key } = identifiers.STOCK_EXIT;
      data.enterprise = session.enterprise;

      data.details = {
        depot_name           : line.depot_name,
        service_display_name : line.service_display_name,
        user_display_name    : line.user_display_name,
        description          : line.description,
        date                 : line.date,
        document_uuid        : line.document_uuid,
        document_reference   : line.document_reference,
        barcode : barcode.generate(key, line.document_uuid),
        document_requisition : line.document_requisition,
      };

      data.rows = rows;

      return report.render(data);
    });
}

module.exports = stockExitServiceReceipt;
