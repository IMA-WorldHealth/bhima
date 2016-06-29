'use strict';
/**
 * Patient Invoice API Controller
 *.@module controllers/finance/patientInvoice
 *
 * @todo (required) major bug - Invoice items are entered based on order or attributes sent from client - this doesn't seem to be consistent as of 2.X
 * @todo GET /invoices/patient/:uuid - retrieve all patient invoices for a specific patient
 *    - should this be /patients/:uuid/invoices?
 * @todo Factor in subsidies, this depends on price lists and billing services infrastructure
 * @todo Credit note logic pending on clear design
 */
const q    = require('q');
const db   = require('../../lib/db');
const uuid = require('node-uuid');
const _    = require('lodash');
const util = require('../../lib/util');
const journal = require('./journal/invoices');

const NotFound = require('../../lib/errors/NotFound');
const BadRequest = require('../../lib/errors/BadRequest');

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

/** Undo the financial effects of a invoice generating an equal and opposite credit note. */
// exports.reverse = reverse;

/**
 * list
 *
 * Retrieves a list of all patient invoices in the database
 */
function list(req, res, next) {

  let invoiceListQuery =
    `SELECT CONCAT(project.abbr, invoice.reference) AS reference, BUID(invoice.uuid) as uuid, cost,
      BUID(invoice.debtor_uuid) as debtor_uuid, CONCAT(patient.first_name, ' - ',  patient.last_name) as patientNames,
      service.name as serviceName, CONCAT(user.first, ' - ', user.last) as createdBy, user_id, date, is_distributable
    FROM invoice
      LEFT JOIN patient ON invoice.debtor_uuid = patient.debtor_uuid
      JOIN service ON service.id = invoice.service_id
      JOIN user ON user.id = invoice.user_id
      JOIN project ON invoice.project_id = project.id;`;

  db.exec(invoiceListQuery)
    .then(function (rows) {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}


/**
 * lookupInvoice
 *
 * Find an invoice by id in the database.
 *
 * @param {string} invoiceUuid - the uuid of the invoice in question
 */
function lookupInvoice(invoiceUuid) {
  let record;
  let buid = db.bid(invoiceUuid);

  let invoiceDetailQuery =
    `SELECT BUID(invoice.uuid) as uuid, CONCAT(project.abbr, invoice.reference) AS reference, invoice.cost,
      BUID(invoice.debtor_uuid) AS debtor_uuid, CONCAT(patient.first_name, " ", patient.last_name) AS debtor_name,
      BUID(patient.uuid) as patient_uuid, user_id, date, invoice.is_distributable
    FROM invoice
    LEFT JOIN patient ON patient.debtor_uuid = invoice.debtor_uuid
    JOIN project ON project.id = invoice.project_id
    WHERE invoice.uuid = ?`;

  let invoiceItemsQuery =
    `SELECT BUID(invoice_item.uuid) as uuid, invoice_item.quantity, invoice_item.inventory_price,
      invoice_item.transaction_price, inventory.code, inventory.text, inventory.consumable
    FROM invoice_item
    LEFT JOIN inventory ON invoice_item.inventory_uuid = inventory.uuid
    WHERE invoice_uuid = ?`;

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

// process invoice items, transforming UUIDs into binary.
function processInvoiceItems(invoice, items) {

  // make sure that invoice items have their uuids
  items.forEach(function (item) {
    item.uuid = db.bid(item.uuid || uuid.v4());
    item.invoice_uuid = invoice.uuid;

    // should every item have an inventory uuid?
    item.inventory_uuid = db.bid(item.inventory_uuid);

    // FIXME -- where is this supposed to have been defined?
    item.debit = 0;
  });

  // create a filter to align invoice item columns to the sql columns
  let filter =
    util.take('uuid', 'inventory_uuid', 'quantity', 'transaction_price', 'inventory_price', 'debit', 'credit', 'invoice_uuid');

  // prepare invoice items for insertion into database
  items = _.map(items, filter);

  return items;
}

/**
 * POST /invoices
 *
 * The function is responsible for billing a patient and calculating the total
 * due on their invoice.  It will create a record in the `invoice` table.
 *
 * Up to three additional tables may be affected:
 *  1. `invoice_items`
 *  2. `invoice_billing_service`
 *  3. `invoice_subsidy`
 *
 * The invoicing procedure of a patient's total invoice goes like this:
 *  1. First, the total sum of the invoice items are recorded as sent from the
 *  client.  The Patient Invoice module is allowed to edit the item costs as it
 *  sees fit, so we use the POSTed costs.
 *  2. Next, each billing service is added to the invoice by writing records to
 *  the `invoice_billing_service` table.  The cost of each billing service is
 *  determined by multiplying the billing service's value (as a percentage) to
 *  the total invoice cost.
 *  3. Finally, the subsidy for the bill is determined.  NOTE - as of #343, we
 *  are only allowing a single subsidy per invoice.  The array of subsidies is
 *  treated identically to the billing_services, except that it subtracts from
 *  the total bill amount.
 *
 * @todo - change the API to pass in only an array of billingService and subsidy
 * ids.
 */
function create(req, res, next) {
  let transaction;

  // alias body properties on local variables
  let invoice = req.body.invoice;
  let items = invoice.items || [];

  /**
   * @todo - the client should only send back an array of ids for the billing
   * services and subsidies.  We have to look them up anyway, so might as well
   * save HTTP bandwidth.
   */
  let billingServices = [];
  if (invoice.billingServices && invoice.billingServices.items) {
    billingServices = invoice.billingServices.items;
  }

  let subsidies = [];
  if (invoice.subsidies && invoice.subsidies.items) {
    subsidies = invoice.subsidies.items;
  }

  // remove the unused properties on invoice object before insertion to the
  // database
  delete invoice.items;
  delete invoice.billingServices;
  delete invoice.subsidies;

  // provide UUID if the client has not specified
  invoice.uuid = db.bid(invoice.uuid || uuid.v4());

  // make sure that the dates have been properly transformed before insert
  if (invoice.date) {
    invoice.date = new Date(invoice.date);
  }

  /** @todo - abstract this into a generic "convert" method */
  if (invoice.debtor_uuid) {
    invoice.debtor_uuid = db.bid(invoice.debtor_uuid);
  }

  // implicitly provide user information based on user session
  invoice.user_id = req.session.user.id;

  // properly convert UUIDs and link invoice to invoice components.
  items = processInvoiceItems(invoice, items);
  /** @todo - remove these maps, since we'll send back an array of ids */
  billingServices = billingServices.map(billingService => billingService.billing_service_id);
  subsidies = subsidies.map(subsidy => subsidy.subsidy_id);

  /**
   * @todo move this check higher in the call stack, as once the API has changed
   */
  if (subsidies.length > 1) {
    throw new BadRequest(`
      An invoice is not allowed to have more than one subsidy.  The
      submitted invoice has ${subsidies.length} subsidies.
    `, 'ERRORS.TOO_MANY_SUBSIDIES');
  }


  // queries

  let insertInvoiceQuery =
    'INSERT INTO invoice SET ?';

  let insertInvoiceItemQuery =
    `INSERT INTO invoice_item (uuid, inventory_uuid, quantity,
        transaction_price, inventory_price, debit, credit, invoice_uuid) VALUES ?;`;

  let itemSumCost  = `
    SET @totalItemsCost = (
      SELECT SUM(credit) AS cost FROM invoice_item WHERE invoice_uuid = ?
    );
  `;

  let insertInvoiceBillingServicesQuery = `
    INSERT INTO invoice_billing_service (invoice_uuid, value, billing_service_id)
    SELECT ?, (billing_service.value / 100) * @totalItemsCost, billing_service.id
    FROM billing_service WHERE id IN (?);
  `;

  let billingSumCost =  `
    SET @billingSumCost = (
      SELECT SUM(value) AS value FROM invoice_billing_service WHERE invoice_uuid = ?
    );
  `;

  let combinedSumCost = `
    SET @combinedSumCost = @totalItemsCost + IFNULL(@billingSumCost, 0);
  `;

  let insertInvoiceSubsidyQuery = `
    INSERT INTO invoice_subsidy (invoice_uuid, value, subsidy_id)
    SELECT ?, (subsidy.value / 100) * @totalItemsCost, subsidy.id
    FROM subsidy WHERE id IN (?);
  `;

  let subsidySumCost = `
    SET @subsidySumCost = (
      SELECT SUM(value) AS value from invoice_subsidy WHERE invoice_uuid = ?
    );
  `;

  let finalSumCost = `
    SET @finalSumCost = @combinedSumCost - IFNULL(@subsidySumCost, 0);
  `;

  let updateInvoiceCostQuery = `
    UPDATE invoice SET cost = @finalSumCost WHERE uuid = ?;
  `;

  transaction = db.transaction();

  // insert invoice line
  transaction
    .addQuery(insertInvoiceQuery, [invoice])

  // insert invoice item lines
    .addQuery(insertInvoiceItemQuery, [items])

  // calculate total cost
    .addQuery(itemSumCost, [invoice.uuid]);

  // if there are billing services, apply them to the bill
  if (billingServices.length) {
    transaction

    // insert the billing services
      .addQuery(insertInvoiceBillingServicesQuery, [invoice.uuid, billingServices])

    // calculate the combined charge
      .addQuery(billingSumCost, [invoice.uuid]);
  }

  // calculate the new sum of the invoice
  transaction
    .addQuery(combinedSumCost);

  // if there are subsidies, insert them
  if (subsidies.length) {
    transaction
      .addQuery(insertInvoiceSubsidyQuery, [invoice.uuid, subsidies])

      .addQuery(subsidySumCost, [invoice.uuid]);
  }

  // make sure that the final computation of costs is correct.
  transaction
    .addQuery(finalSumCost)

  // update the original invoice with the cost
    .addQuery(updateInvoiceCostQuery, [invoice.uuid]);

  journal(transaction, invoice.uuid)
    .then(function () {
      res.status(201).json({
        uuid : uuid.unparse(invoice.uuid)
      });
    })
    .catch(next)
    .done();
}

/**
 * Searches for a invoice by query parameters provided.
 *
 * GET /invoices/search
 */
function search(req, res, next) {

  let additionalTokenQuery = [], additionalTokenCondition = [];

  let sql =
    `SELECT BUID(invoice.uuid) as uuid, invoice.project_id, CONCAT(project.abbr, invoice.reference) AS reference,
      invoice.date, CONCAT(patient.first_name, ' - ',  patient.last_name) as patientNames, invoice.cost,
       BUID(invoice.debtor_uuid) as debtor_uuid, invoice.user_id, invoice.is_distributable,
        service.name as serviceName, CONCAT(user.first, ' - ', user.last) as createdBy
    FROM invoice
    LEFT JOIN patient ON invoice.debtor_uuid = patient.debtor_uuid
    JOIN service ON service.id = invoice.service_id
    JOIN user ON user.id = invoice.user_id
    JOIN project ON project.id = invoice.project_id `;

  if(req.query.is_distributable && req.query.is_distributable === 'all'){
    //In this case it means not filterinf based on distibutable
    delete req.query.is_distributable;
  }

  //if there is parameter to filter on, we add the WHERE clause
  if(Object.keys(req.query).length > 0) {sql += 'WHERE ';}


  if (req.query.debtor_uuid) {
    req.query.debtor_uuid = db.bid(req.query.debtor_uuid);
  }

  if (req.query.uuid) {
    req.query.uuid = db.bid(req.query.uuid);
  }

  if(req.query.reference){
    additionalTokenQuery.push(' CONCAT(project.abbr, invoice.reference) = ?');
    additionalTokenCondition = additionalTokenCondition.concat(req.query.reference);
    delete req.query.reference;
  }

  if(req.query.billingDateFrom && req.query.billingDateTo){

      additionalTokenQuery.push(' DATE(invoice.date) >= DATE(?)');
      additionalTokenCondition = additionalTokenCondition.concat(req.query.billingDateFrom);
      delete req.query.billingDateFrom;

      additionalTokenQuery.push(' DATE(invoice.date) <= DATE(?)');
      additionalTokenCondition = additionalTokenCondition.concat(req.query.billingDateTo);
      delete req.query.billingDateTo;
  }


  let queryObject = util.queryCondition(sql, req.query, true);

  queryObject.query = (queryObject.conditions.length > 0 && additionalTokenQuery.length > 0) ?
      queryObject.query.concat(' AND', additionalTokenQuery.join(' AND')) :
      queryObject.query.concat(additionalTokenQuery.join(' AND'));

  queryObject.conditions = queryObject.conditions.concat(additionalTokenCondition);

  db.exec(queryObject.query, queryObject.conditions)
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
