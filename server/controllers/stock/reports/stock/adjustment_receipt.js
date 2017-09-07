const { _, ReportManager, Stock, identifiers, NotFound, db, STOCK_ADJUSTMENT_TEMPLATE } = require('../common');

/**
 * @method stockAdjustmentReceipt
 *
 * @description
 * This method builds the stock adjustment receipt
 * file to be sent to the client.
 *
 * GET /receipts/stock/adjustment/:document_uuid
 */
function stockAdjustmentReceipt(req, res, next) {
  let report;
  const data = {};
  const documentUuid = req.params.document_uuid;
  const optionReport = _.extend(req.query, { filename : 'STOCK.REPORTS.ADJUSTMENT' });

  // set up the report with report manager
  try {
    report = new ReportManager(STOCK_ADJUSTMENT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  const sql = `
    SELECT i.code, i.text, BUID(m.document_uuid) AS document_uuid, m.is_exit,
      m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total , m.date, m.description,
      u.display_name AS user_display_name,
      CONCAT_WS('.', '${identifiers.DOCUMENT.key}', m.reference) AS document_reference,
      l.label, l.expiration_date, d.text AS depot_name
    FROM stock_movement m
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN depot d ON d.uuid = m.depot_uuid
    JOIN user u ON u.id = m.user_id
    WHERE m.flux_id IN (${Stock.flux.FROM_ADJUSTMENT}, ${Stock.flux.TO_ADJUSTMENT}) AND m.document_uuid = ?
  `;

  return db.exec(sql, [db.bid(documentUuid)])
    .then((rows) => {
      if (!rows.length) {
        throw new NotFound('document not found');
      }
      const line = rows[0];

      data.enterprise = req.session.enterprise;

      data.details = {
        is_exit            : line.is_exit,
        depot_name         : line.depot_name,
        user_display_name  : line.user_display_name,
        description        : line.description,
        date               : line.date,
        document_uuid      : line.document_uuid,
        document_reference : line.document_reference,
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

exports.stockAdjustmentReceipt = stockAdjustmentReceipt;
