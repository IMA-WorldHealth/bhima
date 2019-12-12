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
 *
 * GET /receipts/stock/exit_service/:document_uuid
 */
function stockExitServiceReceipt(req, res, next) {
  let report;
  const data = {};
  const documentUuid = req.params.document_uuid;
  const optionReport = _.extend(req.query, { filename : 'STOCK.REPORTS.EXIT_SERVICE' });

  let template = STOCK_EXIT_SERVICE_TEMPLATE;

  if (Boolean(Number(optionReport.posReceipt))) {
    template = POS_STOCK_EXIT_SERVICE_TEMPLATE;
    _.extend(optionReport, pdf.posReceiptOptions);
  }

  // set up the report with report manager
  try {
    report = new ReportManager(template, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  const sql = `
    SELECT i.code, i.text, BUID(m.document_uuid) AS document_uuid,
      m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total , m.date, m.description,
      u.display_name AS user_display_name, s.name AS service_display_name,
      dm.text AS document_reference,
      l.label, l.expiration_date, d.text AS depot_name
    FROM stock_movement m
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN depot d ON d.uuid = m.depot_uuid
    JOIN service s ON s.uuid = m.entity_uuid
    JOIN user u ON u.id = m.user_id
    JOIN document_map dm ON dm.uuid = m.document_uuid
    WHERE m.is_exit = 1 AND m.flux_id = ${Stock.flux.TO_SERVICE} AND m.document_uuid = ?
  `;

  return db.exec(sql, [db.bid(documentUuid)])
    .then((rows) => {
      if (!rows.length) {
        throw new NotFound('document not found');
      }
      const line = rows[0];
      const { key } = identifiers.STOCK_EXIT;
      data.enterprise = req.session.enterprise;

      data.details = {
        depot_name           : line.depot_name,
        service_display_name : line.service_display_name,
        user_display_name    : line.user_display_name,
        description          : line.description,
        date                 : line.date,
        document_uuid        : line.document_uuid,
        document_reference   : line.document_reference,
        barcode : barcode.generate(key, line.document_uuid),
      };

      data.rows = rows;

      return report.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

module.exports = stockExitServiceReceipt;
