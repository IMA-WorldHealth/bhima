const { _, ReportManager, NotFound, Stock, db, identifiers, STOCK_EXIT_PATIENT_TEMPLATE } = require('../common');

/**
 * @method stockExitPatientReceipt
 *
 * @description
 * This method builds the stock exit to patient receipt
 * file to be sent to the client.
 *
 * GET /receipts/stock/exit_patient/:document_uuid
 */
function stockExitPatientReceipt(req, res, next) {
  let report;
  const data = {};
  const documentUuid = req.params.document_uuid;
  const optionReport = _.extend(req.query, { filename : 'STOCK.REPORTS.EXIT_PATIENT' });

  // set up the report with report manager
  try {
    report = new ReportManager(STOCK_EXIT_PATIENT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  const sql = `
    SELECT i.code, i.text, BUID(m.document_uuid) AS document_uuid,
      m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total , m.date, m.description,
      u.display_name AS user_display_name, p.display_name AS patient_display_name,
      CONCAT_WS('.', '${identifiers.DOCUMENT.key}', m.reference) AS document_reference,
      CONCAT_WS('.', '${identifiers.PATIENT.key}', proj.abbr, p.reference) AS patient_reference, p.hospital_no,
      l.label, l.expiration_date, d.text AS depot_name
    FROM stock_movement m
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN depot d ON d.uuid = m.depot_uuid
    JOIN patient p ON p.uuid = m.entity_uuid
    JOIN project proj ON proj.id = p.project_id
    JOIN user u ON u.id = m.user_id
    WHERE m.is_exit = 1 AND m.flux_id = ${Stock.flux.TO_PATIENT} AND m.document_uuid = ?
  `;

  return db.exec(sql, [db.bid(documentUuid)])
    .then((rows) => {
      if (!rows.length) {
        throw new NotFound('document not found');
      }
      const line = rows[0];

      data.enterprise = req.session.enterprise;

      data.details = {
        depot_name           : line.depot_name,
        patient_reference    : line.patient_reference,
        patient_display_name : line.patient_display_name,
        hospital_no          : line.hospital_no,
        user_display_name    : line.user_display_name,
        description          : line.description,
        date                 : line.date,
        document_uuid        : line.document_uuid,
        document_reference   : line.document_reference,
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

exports.stockExitPatientReceipt = stockExitPatientReceipt;
