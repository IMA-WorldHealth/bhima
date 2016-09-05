'use strict';

/**
 * Patient Invoice API Controller
 *
 *@module controllers/finance/patientInvoice
 *
 * @todo (required) major bug - Invoice items are entered based on order or attributes sent from client - this doesn't seem to be consistent as of 2.X
 * @todo GET /invoices/patient/:uuid - retrieve all patient invoices for a specific patient
 *    - should this be /patients/:uuid/invoices?
 * @todo Factor in subsidies, this depends on price lists and billing services infrastructure
 */


const q    = require('q');
const db   = require('../../lib/db');
const uuid = require('node-uuid');
const _    = require('lodash');
const util = require('../../lib/util');
const journal = require('./journal/invoices');

const NotFound = require('../../lib/errors/NotFound');
const BadRequest = require('../../lib/errors/BadRequest');

const createInvoice = require('./invoice/patientInvoice.create');
const listReceipt = require('../finance/reports/list');

/** Retrieves a list of all patient invoices (accepts ?q delimiter). */
exports.list = list;

/** Retrieves details for a specific patient invoice. */
exports.details = details;

/** Write a new patient invoice record and attempt to post it to the journal. */
exports.create = create;

/** Filter the patient invoice table by any column via query strings */
exports.search = search;

/**
 * Retrieves an invoice uuid by searching for a human readable reference (e.g. HBB123)
 */
exports.reference = reference;

/** Expose lookup invoice for other controllers to use internally */
exports.lookupInvoice = lookupInvoice;


exports.getPatientInvoice = getPatientInvoice;

/** Undo the financial effects of a invoice generating an equal and opposite credit note. */
// exports.reverse = reverse;


/**
 * list
 *
 * Retrieves a list of all patient invoices in the database
 */
function list(req, res, next) {
  listInvoices()
  .then(function (invoices) {
    res.status(200).json(invoices);
  })
  .catch(next)
  .done();
}


/**
 * @method listInvoices
 *
 * @description
 * Looks up all patients invoices in the data base
 *
 */
function listInvoices() {
  let sql =
    `SELECT CONCAT(project.abbr, invoice.reference) AS reference, BUID(invoice.uuid) as uuid, cost,
      BUID(invoice.debtor_uuid) as debtor_uuid, patient.display_name as patientNames,
      service.name as serviceName, user.display_name, voucher.type_id,
      invoice.date, invoice.is_distributable
    FROM invoice
      LEFT JOIN patient ON invoice.debtor_uuid = patient.debtor_uuid
      JOIN service ON service.id = invoice.service_id
      LEFT JOIN voucher ON voucher.reference_uuid = invoice.uuid
      JOIN user ON user.id = invoice.user_id
      JOIN project ON invoice.project_id = project.id
    ORDER BY invoice.reference ASC, invoice.date ASC;`;

  return db.exec(sql)
  .then(function (rows) {
    if (rows.length === 0) {
      throw new NotFound(`Could not find Patient Invoice `);
    }
    return rows;
  });
}

/**
 * @method lookupInvoice
 *
 * @description
 * Find an invoice by id in the database.
 *
 * @param {string} invoiceUuid - the uuid of the invoice in question
 */
function lookupInvoice(invoiceUuid) {
  let record = {};
  let buid = db.bid(invoiceUuid);

  let invoiceDetailQuery =
    `SELECT BUID(invoice.uuid) as uuid, CONCAT(project.abbr, invoice.reference) AS reference,
      invoice.cost, invoice.description, BUID(invoice.debtor_uuid) AS debtor_uuid,
      patient.display_name AS debtor_name,   BUID(patient.uuid) as patient_uuid,
      invoice.user_id, invoice.date, invoice.is_distributable, voucher.type_id,
      user.display_name
    FROM invoice
    LEFT JOIN patient ON patient.debtor_uuid = invoice.debtor_uuid
    LEFT JOIN voucher ON voucher.reference_uuid = invoice.uuid
    JOIN project ON project.id = invoice.project_id
    JOIN user ON user.id = invoice.user_id
    WHERE invoice.uuid = ?`;

  let invoiceItemsQuery =
    `SELECT BUID(invoice_item.uuid) as uuid, invoice_item.quantity, invoice_item.inventory_price,
      invoice_item.transaction_price, inventory.code, inventory.text, inventory.consumable
    FROM invoice_item
    LEFT JOIN inventory ON invoice_item.inventory_uuid = inventory.uuid
    WHERE invoice_uuid = ?`;

  let invoiceBillingQuery =
    `SELECT invoice_billing_service.value, billing_service.label, billing_service.value AS billing_value
    FROM invoice_billing_service
    JOIN billing_service ON billing_service.id = invoice_billing_service.billing_service_id
    WHERE invoice_billing_service.invoice_uuid = ?`;

  let invoiceSubsidyQuery = `
    SELECT invoice_subsidy.value, subsidy.label, subsidy.value AS subsidy_value
    FROM invoice_subsidy
    JOIN subsidy ON subsidy.id = invoice_subsidy.subsidy_id
    WHERE invoice_subsidy.invoice_uuid = ?;
  `;

  return db.exec(invoiceDetailQuery, [buid])
    .then(function (rows) {

      if (!rows.length) {
        throw new NotFound(`Could not find a invoice with uuid ${invoiceUuid}`);
      }

      record = rows[0];
      return db.exec(invoiceItemsQuery, [buid]);
    })
    .then(function (rows) {
      record.items = rows;
      return db.exec(invoiceBillingQuery, [buid]);
    })
    .then(function (rows) {
      record.billing = rows;

      return db.exec(invoiceSubsidyQuery, [buid]);
    })
    .then(function (rows) {
      record.subsidy = rows;

      return record;
    });
}

/**
 * @todo Read the balance remaining on the debtors account given the invoice as an auxiliary step
 */
function details(req, res, next) {
  // this assumes a value must be past for this route to initially match
  lookupInvoice(req.params.uuid)
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}

function create(req, res, next) {
  let invoiceDetails = req.body.invoice;
  invoiceDetails.user_id = req.session.user.id;

  let preparedTransaction = createInvoice(invoiceDetails);
  preparedTransaction.execute()
    .then(function (result) {
      res.status(201).json({
        uuid : uuid.unparse(invoiceDetails.uuid)
      });
    })
    .catch(next)
    .done();
}

function find(options) {

  // remove the limit first thing, if it exists
  let limit = Number(options.limit);
  delete options.limit;

  // support flexible queries by keeping a growing list of conditions and
  // statements
  let conditions = {
    statements: [],
    parameters: []
  };

  let sql =`
    SELECT BUID(invoice.uuid) as uuid, invoice.project_id, CONCAT(project.abbr, invoice.reference) AS reference,
      invoice.date, patient.display_name as patientName, invoice.cost,
      BUID(invoice.debtor_uuid) as debtor_uuid, invoice.user_id, invoice.is_distributable,
      service.name as serviceName, user.display_name, voucher.type_id
    FROM invoice
    LEFT JOIN patient ON invoice.debtor_uuid = patient.debtor_uuid
    LEFT JOIN voucher ON voucher.reference_uuid = invoice.uuid
    JOIN service ON service.id = invoice.service_id
    JOIN user ON user.id = invoice.user_id
    JOIN project ON project.id = invoice.project_id
    WHERE
  `;

  if (options.debtor_uuid) {
    options.debtor_uuid = db.bid(options.debtor_uuid);
  }

  if (options.uuid) {
    options.uuid = db.bid(options.uuid);
  }

  if (options.reference) {
    conditions.statements.push('CONCAT(project.abbr, invoice.reference) = ?');
    conditions.parameters.push(options.reference);
    delete options.reference;
  }

  if (options.billingDateFrom) {
    conditions.statements.push('DATE(invoice.date) >= DATE(?)');
    conditions.parameters.push(options.billingDateFrom);
    delete options.billingDateFrom;
  }

  if (options.billingDateTo) {
    conditions.statements.push('DATE(invoice.date) <= DATE(?)');
    conditions.parameters.push(options.billingDateTo);
    delete options.billingDateTo;
  }

  sql += conditions.statements.join(' AND ');
  if (conditions.statements.length && !_.isEmpty(options)) { sql += ' AND '; }
  let query = util.queryCondition(sql, options, true);

  sql = query.query;
  let parameters = conditions.parameters.concat(query.conditions);

  // finally, apply the LIMIT query
  if (!isNaN(limit)) {
    sql += 'LIMIT ?;';
    parameters.push(limit);
  }

  // if nothing was submitted to the search, get all records
  // this writes in WHERE 1; to the SQL query
  if (!parameters.length) {
    sql += ' 1;';
  }

  parameters = parameters.concat(conditions.parameters);

  return db.exec(sql, parameters);
}

/**
 * Searches for a invoice by query parameters provided.
 *
 * GET /invoices/search
 */
function search(req, res, next) {
  find(req.query)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
 * Searches for a particular invoice uuid by reference string.
 *
 * NOTE - this cannot be combined with the /search route since it would require
 * wrapping a MySQL query in an outer query to do the filtering.  This would be
 * highly inefficient in most cases, or lead to complex code.
 *
 * GET invoices/references/:reference
 */
function reference(req, res, next) {
  let sql =
    `SELECT BUID(i.uuid) as uuid FROM (
      SELECT invoice.uuid, CONCAT(project.abbr, invoice.reference) AS reference
      FROM invoice JOIN project ON invoice.project_id = project.id
    ) i WHERE i.reference = ?;`;

  db.exec(sql, [ req.params.reference ])
  .then(function (rows) {
    if (!rows.length) {
      throw new NotFound(`Could not find a invoice with reference ${req.params.reference}`);
    }

    // references should be unique -- send back only the first result
    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
}


/**
* GET /invoices/patient/report
* Returns a pdf file for Patient Invoice
*
* @function getPatientInvoice
*/
function getPatientInvoice(req, res, next) {
  const request = {
    query : req.query,
    enterprise : req.session.enterprise,
    project : req.session.project
  };

  listInvoices()
  .then(invoices => listReceipt.build(invoices, request))
  .then(result => {
    const renderer = {
      'pdf'  : '"Content-Type" : "application/pdf"',
      'html' : '"Content-Type" : "application/html"',
      'json' : '"Content-Type" : "application/json"'
    };
    let headerKey = req.query.renderer || 'pdf';
    let headers = renderer[headerKey];
    res.set(headers).send(result);
  })
  .catch(next);
}
