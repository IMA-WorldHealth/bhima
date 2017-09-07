const { _, ReportManager, Stock, identifiers, NotFound, db, STOCK_ENTRY_PURCHASE_TEMPLATE } = require('../common');

/**
 * @method stockEntryPurchaseReceipt
 *
 * @description
 * This method builds the stock inventory report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /receipts/stock/entry_purchase/:document_uuid
 */
function stockEntryPurchaseReceipt(req, res, next) {
  let report;
  const data = {};
  const documentUuid = req.params.document_uuid;
  const optionReport = _.extend(req.query, { filename : 'STOCK.RECEIPTS.ENTRY_PURCHASE' });

  // set up the report with report manager
  try {
    report = new ReportManager(STOCK_ENTRY_PURCHASE_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  const sql = `
    SELECT i.code, i.text, BUID(m.document_uuid) AS document_uuid,
      m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total , m.date, m.description,
      u.display_name AS user_display_name,
      CONCAT_WS('.', '${identifiers.DOCUMENT.key}', m.reference) AS document_reference,
      l.label, l.expiration_date, d.text AS depot_name,
      CONCAT_WS('.', '${identifiers.PURCHASE_ORDER.key}', proj.abbr, p.reference) AS purchase_reference,
      p.note, p.cost, p.date AS purchase_date, p.payment_method,
      s.display_name AS supplier_display_name, proj.name AS project_display_name
    FROM stock_movement m
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN depot d ON d.uuid = m.depot_uuid
    JOIN user u ON u.id = m.user_id
    JOIN purchase p ON p.uuid = l.origin_uuid
    JOIN supplier s ON s.uuid = p.supplier_uuid
    JOIN project proj ON proj.id = p.project_id
    WHERE m.is_exit = 0 AND m.flux_id = ${Stock.flux.FROM_PURCHASE} AND m.document_uuid = ?
    ORDER BY i.text, l.label
  `;

  return db.exec(sql, [db.bid(documentUuid)])
    .then((rows) => {
      if (!rows.length) {
        throw new NotFound('document not found');
      }
      const line = rows[0];

      data.enterprise = req.session.enterprise;

      data.details = {
        depot_name            : line.depot_name,
        user_display_name     : line.user_display_name,
        description           : line.description,
        date                  : line.date,
        document_uuid         : line.document_uuid,
        document_reference    : line.document_reference,
        purchase_reference    : line.purchase_reference,
        p_note                : line.note,
        p_cost                : line.cost,
        p_date                : line.purchase_date,
        p_method              : line.payment_method,
        supplier_display_name : line.supplier_display_name,
        project_display_name  : line.project_display_name,
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

exports.stockEntryPurchaseReceipt = stockEntryPurchaseReceipt;
