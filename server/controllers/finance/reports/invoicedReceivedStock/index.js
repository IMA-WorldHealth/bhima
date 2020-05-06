const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');
const Patients = require('../../../medical/patients');

const TEMPLATE = './server/controllers/finance/reports/invoicedReceivedStock/report.handlebars';
// expose to the API
exports.report = report;

// default report parameters
const DEFAULT_PARAMS = {
  csvKey : 'invoiced_received_stock',
  filename : 'REPORT.PATIENT_STANDING.DESCRIPTION',
  orientation : 'landscape',
};

/**
 * @function report
 *
 * @description
 * This report makes it possible to attach the items billed to a patient on 
 * the articulated items consumed or distributed to the Patient.
 */
function report(req, res, next) {
  const params = req.query;
  const patientUuid = req.params.uuid;

  const data = {};
  let reporting;

  params.dateFrom = new Date(params.dateFrom);
  params.dateTo = new Date(params.dateTo);

  data.period = {
    dateFrom : params.dateFrom,
    dateTo : params.dateTo,
  };

  const sqlInvoice = `
    SELECT iv.uuid, map.text, iv.date
    FROM invoice AS iv
    JOIN debtor AS d ON d.uuid = iv.debtor_uuid
    JOIN patient AS p ON p.debtor_uuid = d.uuid
    JOIN document_map AS map ON map.uuid = iv.uuid
    WHERE p.uuid = ? AND (DATE(iv.date) >= DATE(?) AND DATE(iv.date) <= DATE(?)) 
  `;

  const sqlInventoriesInvoiced = `
    SELECT BUID(p.uuid) AS patientUuid, p.display_name, iv.reference, map.text AS invoiceReference,
    iv.date, inv.text AS inventory_text, inv.uuid AS inventory_uuid, 
    inv.code AS inventory_code, itm.quantity AS quantity_invoiced, itm.inventory_price AS price_invoiced
    FROM patient AS p
    JOIN debtor AS d ON d.uuid = p.debtor_uuid
    JOIN invoice AS iv ON iv.debtor_uuid = d.uuid
    JOIN invoice_item AS itm ON itm.invoice_uuid = iv.uuid
    JOIN inventory AS inv ON inv.uuid = itm.inventory_uuid
    JOIN document_map AS map ON map.uuid = iv.uuid
    WHERE p.uuid = ? AND (DATE(iv.date) >= DATE(?) AND DATE(iv.date) <= DATE(?)) 
    AND inv.consumable = 1
    ORDER BY inv.text ASC, iv.date DESC;  
  `;

  const sqlItemInvoicedDistibuted = `
    SELECT BUID(p.uuid) AS patientUuid, mov.lot_uuid, SUM(mov.quantity) AS quantity,
    mov.unit_cost, inv.uuid AS inventory_uuid, inv.uuid AS inventory_uuid,
    inv.code AS inventory_code, inv.text AS inventory_text, map.text AS invoiceReference, iv.date
    FROM patient AS p
    JOIN stock_movement AS mov ON mov.entity_uuid = p.uuid
    JOIN lot AS l ON l.uuid = mov.lot_uuid
    JOIN inventory AS inv ON inv.uuid = l.inventory_uuid
    JOIN invoice AS iv ON iv.uuid = mov.invoice_uuid
    JOIN document_map AS map ON map.uuid = iv.uuid
    WHERE p.uuid = ? AND (DATE(iv.date) >= DATE(?) AND DATE(iv.date) <= DATE(?)) AND mov.is_exit = 1
    GROUP BY inv.uuid, iv.uuid;
  `;

  const sqlNoInvoiceAttributionAggregat = `
    SELECT DISTINCT(mov.document_uuid) AS document_uuid, map.text AS document, mov.date
    FROM patient AS p
    JOIN stock_movement AS mov ON mov.entity_uuid = p.uuid
    JOIN document_map AS map ON map.uuid = mov.document_uuid
    WHERE p.uuid = ? AND (DATE(mov.date) >= DATE(?) AND DATE(mov.date) <= DATE(?)) AND mov.invoice_uuid IS NULL
    ORDER BY mov.date DESC;
  `;

  const sqlNoInvoiceAttribution = `
    SELECT BUID(p.uuid) AS patientUuid, mov.document_uuid, mov.quantity, mov.unit_cost, map.text AS document,
    iv.text AS inventory_text, (mov.quantity * mov.unit_cost) AS total_cost, mov.date
    FROM patient AS p
    JOIN stock_movement AS mov ON mov.entity_uuid = p.uuid
    JOIN lot AS l ON l.uuid = mov.lot_uuid
    JOIN inventory AS iv ON iv.uuid = l.inventory_uuid
    JOIN document_map AS map ON map.uuid = mov.document_uuid
    WHERE p.uuid = ? AND (DATE(mov.date) >= DATE(?) AND DATE(mov.date) <= DATE(?)) 
    AND mov.is_exit = 1 AND mov.invoice_uuid IS NULL
    ORDER BY iv.text ASC;
  `;

  _.defaults(params, DEFAULT_PARAMS);

  try {
    reporting = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    next(e);
    return;
  }

  const dbPromises = [
    Patients.lookupPatient(patientUuid),
    db.exec(sqlInvoice, [db.bid(patientUuid), params.dateFrom, params.dateTo]),
    db.exec(sqlInventoriesInvoiced, [db.bid(patientUuid), params.dateFrom, params.dateTo]),
    db.exec(sqlItemInvoicedDistibuted, [db.bid(patientUuid), params.dateFrom, params.dateTo]),
    db.exec(sqlNoInvoiceAttributionAggregat, [db.bid(patientUuid), params.dateFrom, params.dateTo]),
    db.exec(sqlNoInvoiceAttribution, [db.bid(patientUuid), params.dateFrom, params.dateTo]),
  ];

  Promise.all(dbPromises)
    .then(([patient, invoices, inventoriesInvoiced, inventoriesInvoicedDistibuted,
      noInvoiceAttributionAggregat, NoInvoiceAttribution]) => {

      _.extend(data, { patient });

      invoices.forEach(invoice => {
        invoice.inventories = [];
        inventoriesInvoiced.forEach(inventory => {
          if (invoice.text === inventory.invoiceReference) {
            inventory.quantity_distributed = 0;
            inventory.cost_distributed = 0;
            inventory.quantity_difference = 0;
            invoice.inventories.push(inventory);
          }
        });

        invoice.emptyInvoice = (invoice.inventories.length === 0);
      });

      invoices.forEach(invoice => {
        invoice.inventories.forEach(invoiced => {
          inventoriesInvoicedDistibuted.forEach(distributed => {
            if ((invoiced.invoiceReference === distributed.invoiceReference)
            && (invoiced.inventory_text === distributed.inventory_text)) {
              invoiced.quantity_distributed = distributed.quantity;
              invoiced.cost_distributed = distributed.unit_cost;
              invoiced.quantity_difference = invoiced.quantity_invoiced - distributed.quantity;
              invoiced.cost_difference = invoiced.price_invoiced - distributed.unit_cost;
            }
          });
        });
      });

      // Search for items not billed but distributed to the Patient
      inventoriesInvoicedDistibuted.forEach(distributed => {
        let countInvoicing = 0;
        invoices.forEach(invoice => {
          invoice.inventories.forEach(invoiced => {
            if ((invoiced.invoiceReference === distributed.invoiceReference)
            && (invoiced.inventory_text === distributed.inventory_text)) {
              countInvoicing++;
            }
          });
          distributed.isInvoiced = (countInvoicing > 0);
        });
      });

      // Integrations of items not invoiced but distributed to the Patient
      inventoriesInvoicedDistibuted.forEach(distributed => {
        invoices.forEach(invoice => {
          if ((invoice.text === distributed.invoiceReference)
          && (!distributed.isInvoiced)) {
            distributed.quantity_invoiced = 0;
            distributed.price_invoiced = 0;

            distributed.quantity_distributed = distributed.quantity;
            distributed.cost_distributed = distributed.unit_cost;
            distributed.quantity_difference = 0 - distributed.quantity;
            distributed.cost_difference = 0 - distributed.unit_cost;

            invoice.inventories.push(distributed);
          }
        });
      });

      noInvoiceAttributionAggregat.forEach(movement => {
        movement.inventories = [];
        movement.total_movement = 0;
        NoInvoiceAttribution.forEach(inventory => {
          if (movement.document === inventory.document) {
            movement.inventories.push(inventory);
            movement.total_movement += inventory.total_cost;
          }
        });
      });

      data.invoices = invoices;
      data.noInvoiceAttributionAggregat = noInvoiceAttributionAggregat;

      return reporting.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}
