const { _, ReportManager, Stock, identifiers, NotFound, db, STOCK_EXIT_LOSS_TEMPLATE } = require('../common');

/**
 * @method stockExitLossReceipt
 *
 * @description
 * This method builds the stock inventory report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /receipts/stock/exit_loss/:document_uuid
 */
function stockExitLossReceipt(req, res, next) {
  let report;
  const data = {};
  const documentUuid = req.params.document_uuid;
  const optionReport = _.extend(req.query, { filename : 'STOCK.REPORTS.EXIT_LOSS' });

  // set up the report with report manager
  try {
    report = new ReportManager(STOCK_EXIT_LOSS_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  const sql = `
    SELECT i.code, i.text, BUID(m.document_uuid) AS document_uuid,
      m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total , m.date, m.description,
      u.display_name AS user_display_name,
      CONCAT_WS('.', '${identifiers.DOCUMENT.key}', m.reference) AS document_reference,
      l.label, l.expiration_date, d.text AS depot_name
    FROM stock_movement m
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN depot d ON d.uuid = m.depot_uuid
    JOIN user u ON u.id = m.user_id
    WHERE m.is_exit = 1 AND m.flux_id = ${Stock.flux.TO_LOSS} AND m.document_uuid = ?
  `;

  return db.exec(sql, [db.bid(documentUuid)])
    .then((rows) => {
      if (!rows.length) {
        throw new NotFound('document not found');
      }
      const line = rows[0];

      data.enterprise = req.session.enterprise;

      data.details = {
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

exports.stockExitLossReceipt = stockExitLossReceipt;
