const db = require('../../../lib/db');
const identifiers = require('../../../config/identifiers');

/**
 * @function lookupConsumableInvoicePatient
 *
 * @description
 * this function return an invoice details and all consumable inventories
 * related to this invoice
 */
function lookupConsumableInvoicePatient(req, res, next) {
  const params = req.query;
  const record = {};

  const invoiceDetailQuery =
    `SELECT
      BUID(invoice.uuid) as uuid, CONCAT_WS('.', '${identifiers.INVOICE.key}',
      project.abbr, invoice.reference) AS reference, invoice.cost,
      invoice.description, BUID(invoice.debtor_uuid) AS debtor_uuid,
      patient.display_name AS debtor_name,   BUID(patient.uuid) as patient_uuid,
      invoice.user_id, invoice.date, user.display_name, invoice.service_id,
      service.name AS serviceName, enterprise.currency_id
    FROM invoice
    LEFT JOIN patient ON patient.debtor_uuid = invoice.debtor_uuid
    JOIN service ON invoice.service_id = service.id
    JOIN project ON project.id = invoice.project_id
    JOIN enterprise ON enterprise.id = project.enterprise_id
    JOIN user ON user.id = invoice.user_id
    JOIN document_map AS dm ON dm.uuid = invoice.uuid
    WHERE dm.text = ? AND patient.uuid = ?;`;

  const invoiceItemsQuery =
    `SELECT
      BUID(invoice_item.uuid) as uuid, invoice_item.quantity, 
        invoice_item.inventory_price, invoice_item.transaction_price,
      BUID(inventory.uuid) as inventory_uuid, inventory.code, inventory.text,
        inventory.consumable, inventory_unit.text AS inventory_unit
    FROM invoice_item
    JOIN inventory ON invoice_item.inventory_uuid = inventory.uuid
    JOIN inventory_unit ON inventory_unit.id = inventory.unit_id
    WHERE invoice_uuid = ? AND inventory.consumable = 1`;

  db.exec(invoiceDetailQuery, [params.invoiceReference, db.bid(params.patientUuid)])
    .then(details => {
      if (!details.length) { return null; }

      [record.details] = details;

      return db.exec(invoiceItemsQuery, [db.bid(record.details.uuid)]);
    })
    .then(items => {
      record.items = items;

      res.status(200).json(record);
    })
    .catch(next);
}

module.exports.lookupConsumableInvoicePatient = lookupConsumableInvoicePatient;
