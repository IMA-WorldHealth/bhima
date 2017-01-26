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

const Q      = require('q');
const moment = require('moment');
const uuid   = require('node-uuid');
const _      = require('lodash');

const identifiers = require('../../config/identifiers');
const entityIdentifier = identifiers.INVOICE.key;

const util   = require('../../lib/util');
const db     = require('../../lib/db');
const barcode = require('../../lib/barcode');

const FilterParser = require('../../lib/filter');

const NotFound = require('../../lib/errors/NotFound');
const BadRequest = require('../../lib/errors/BadRequest');

const createInvoice = require('./invoice/patientInvoice.create');

/** Retrieves a list of all patient invoices (accepts ?q delimiter). */
exports.list = list;

/** Retrieves details for a specific patient invoice. */
exports.detail = detail;

/** Write a new patient invoice record and attempt to post it to the journal. */
exports.create = create;

/** Filter the patient invoice table by any column via query strings */
exports.search = search;

/** Expose lookup invoice for other controllers to use internally */
exports.lookupInvoice = lookupInvoice;

exports.find = find;

/**
 * list
 *
 * Retrieves a list of all patient invoices in the database
 */
function list(req, res, next) {
  find({})
    .then(function (invoices) {
      res.status(200).json(invoices);
    })
    .catch(next)
    .done();
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
    `SELECT BUID(invoice.uuid) as uuid, CONCAT_WS('.', '${identifiers.INVOICE.key}', project.abbr, invoice.reference) AS reference,
      invoice.cost, invoice.description, BUID(invoice.debtor_uuid) AS debtor_uuid,
      patient.display_name AS debtor_name,   BUID(patient.uuid) as patient_uuid,
      invoice.user_id, invoice.date, user.display_name,
      enterprise.currency_id
    FROM invoice
    LEFT JOIN patient ON patient.debtor_uuid = invoice.debtor_uuid
    JOIN project ON project.id = invoice.project_id
    JOIN enterprise ON enterprise.id = project.enterprise_id
    JOIN user ON user.id = invoice.user_id
    WHERE invoice.uuid = ?;`;

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

  return db.one(invoiceDetailQuery, [buid], invoiceUuid, 'invoice')
    .then(invoice => {
      record = invoice;
      return db.exec(invoiceItemsQuery, [buid]);
    })
    .then(rows => {
      record.items = rows;
      return db.exec(invoiceBillingQuery, [buid]);
    })
    .then(rows => {
      record.billing = rows;
      return db.exec(invoiceSubsidyQuery, [buid]);
    })
    .then(rows => {
      record.subsidy = rows;

      // provide barcode string to be rendered by client/ receipts
      record.barcode = barcode.generate(entityIdentifier, record.uuid);
      return record;
    });
}

/**
 * @todo Read the balance remaining on the debtors account given the invoice as an auxiliary step
 */
function detail(req, res, next) {

  // this assumes a value must be past for this route to initially match
  lookupInvoice(req.params.uuid)
    .then(function (record) {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

function create(req, res, next) {
  const invoice = req.body.invoice;
  invoice.user_id = req.session.user.id;

  const hasInvoiceItems = (invoice.items && invoice.items.length > 0);

  // detect missing items early and respond with an error
  if (!hasInvoiceItems) {
    return next(
      new BadRequest(`An invoice must be submitted with invoice items.`)
    );
  }

  const preparedTransaction = createInvoice(invoice);
  preparedTransaction.execute()
    .then(() => {
      res.status(201).json({
        uuid : uuid.unparse(invoice.uuid)
      });
    })
    .catch(next)
    .done();
}

function find(options) {
  let filters = new FilterParser(options, { tableAlias : 'q' });

  // @FIXME Remove this with client side filter design
  delete options.patientNames;

  let sql =`
    SELECT BUID(invoice.uuid) as uuid, invoice.project_id, invoice.date,
      patient.display_name as patientName, invoice.cost, BUID(invoice.debtor_uuid) as debtor_uuid,
      CONCAT_WS('.', '${identifiers.INVOICE.key}', project.abbr, invoice.reference) AS reference,
      service.name as serviceName, user.display_name, enterprise.currency_id, voucher.type_id,
      invoice.user_id
    FROM invoice
    LEFT JOIN patient ON invoice.debtor_uuid = patient.debtor_uuid
    LEFT JOIN voucher ON voucher.reference_uuid = invoice.uuid
    JOIN service ON service.id = invoice.service_id
    JOIN user ON user.id = invoice.user_id
    JOIN project ON project.id = invoice.project_id
    JOIN enterprise ON enterprise.id = project.enterprise_id
  `;

  db.convert(options, ['debtor_uuid', 'uuid']);

  if (options.debtor_uuid) {
    options.debtor_uuid = db.bid(options.debtor_uuid);
  }

  if (options.uuid) {
    options.uuid = db.bid(options.uuid);
  }

  if (options.reference) {
    conditions.statements.push(`CONCAT_WS('.', '${identifiers.INVOICE.key}', project.abbr, invoice.reference) = ?`);
    conditions.parameters.push(options.reference);
    delete options.reference;
  }

  if (options.debtor_uuid) {
    options.debtor_uuid = db.bid(options.debtor_uuid);
    conditions.statements.push('invoice.debtor_uuid = ?');
    conditions.parameters.push(options.debtor_uuid);
    delete options.debtor_uuid;
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

  if (options.patientUuid) {
    options.patientUuid = db.bid(options.patientUuid);
    conditions.statements.push('patient.uuid = ?');
    conditions.parameters.push(options.patientUuid);
    delete options.patientUuid;
  }

  if (options.user_id) {
    conditions.statements.push('invoice.user_id = ?');
    conditions.parameters.push(options.user_id);
    delete options.user_id;
  }


  sql += conditions.statements.join(' AND ');
  if (conditions.statements.length && !_.isEmpty(options)) { sql += ' AND '; }
  let query = util.queryCondition(sql, options, true);

  sql = query.query;
  let parameters = conditions.parameters.concat(query.conditions);

  // if nothing was submitted to the search, get all records
  // this writes in WHERE 1; to the SQL query
  if (!parameters.length) {
    sql += ' 1';
  }

  // add in the ORDER BY date DESC
  sql += ' ORDER BY invoice.date DESC, invoice.reference DESC ';

  // finally, apply the LIMIT query
  if (!isNaN(limit)) {
    sql += 'LIMIT ?;';
    parameters.push(limit);
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
