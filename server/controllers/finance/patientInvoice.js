'use strict';
/**
 * Patient Invoice API Controller
 *.@module controllers/finance/patientInvoice
 *
 * @todo (required) major bug - Sale items are entered based on order or attributes sent from client - this doesn't seem to be consistent as of 2.X
 * @todo GET /sales/patient/:uuid - retrieve all patient invoices for a specific patient
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
 * Retrieves a sale uuid by searching for a human readable reference (e.g. HBB123)
 */
exports.reference = reference;

/** Expose lookup sale for other controllers to use internally */
exports.lookupSale = lookupSale;

/** Undo the financial effects of a sale generating an equal and opposite credit note. */
// exports.reverse = reverse;

/**
 * list
 *
 * Retrieves a list of all patient invoices in the database
 */
function list(req, res, next) {

  let saleListQuery =
    `SELECT CONCAT(project.abbr, sale.reference) AS reference, BUID(sale.uuid) as uuid, cost,
      BUID(sale.debtor_uuid) as debtor_uuid, user_id, date, is_distributable
    FROM sale
      LEFT JOIN patient ON sale.debtor_uuid = patient.debtor_uuid
      JOIN project ON sale.project_id = project.id;`;

  db.exec(saleListQuery)
    .then(function (rows) {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}


/**
 * lookupSale
 *
 * Find a sale by id in the database.
 *
 * @param {string} invoiceUuid - the uuid of the sale in question
 */
function lookupSale(invoiceUuid) {
  let record;
  let buid = db.bid(invoiceUuid);

  let saleDetailQuery =
    `SELECT BUID(sale.uuid) as uuid, CONCAT(project.abbr, sale.reference) AS reference, sale.cost,
      BUID(sale.debtor_uuid) AS debtor_uuid, CONCAT(patient.first_name, " ", patient.last_name) AS debtor_name,
      BUID(patient.uuid) as patient_uuid, user_id, discount, date, sale.is_distributable
    FROM sale
    LEFT JOIN patient ON patient.debtor_uuid = sale.debtor_uuid
    JOIN project ON project.id = sale.project_id
    WHERE sale.uuid = ?`;

  let saleItemsQuery =
    `SELECT BUID(sale_item.uuid) as uuid, sale_item.quantity, sale_item.inventory_price,
      sale_item.transaction_price, inventory.code, inventory.text, inventory.consumable
    FROM sale_item
    LEFT JOIN inventory ON sale_item.inventory_uuid = inventory.uuid
    WHERE sale_uuid = ?`;

  return db.exec(saleDetailQuery, [buid])
    .then(function (rows) {

      if (!rows.length) {
        throw new NotFound(`Could not find a sale with uuid ${invoiceUuid}`);
      }

      record = rows[0];
      return db.exec(saleItemsQuery, [buid]);
    })
    .then(function (rows) {
      record.items = rows;
      return record;
    });
}

/**
 * @todo Read the balance remaining on the debtors account given the sale as an auxiliary step
 */
function details(req, res, next) {

  // this assumes a value must be past for this route to initially match
  lookupSale(req.params.uuid)
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}

// process sale items, transforming UUIDs into binary.
function processSaleItems(sale, items) {

  // make sure that sale items have their uuids
  items.forEach(function (item) {
    item.uuid = db.bid(item.uuid || uuid.v4());
    item.sale_uuid = sale.uuid;

    // should every item have an inventory uuid?
    item.inventory_uuid = db.bid(item.inventory_uuid);

    // FIXME -- where is this supposed to have been defined?
    item.debit = 0;
  });

  // create a filter to align sale item columns to the sql columns
  let filter =
    util.take('uuid', 'inventory_uuid', 'quantity', 'transaction_price', 'inventory_price', 'debit', 'credit', 'sale_uuid');

  // prepare sale items for insertion into database
  items = _.map(items, filter);

  return items;
}

/**
 * POST /sales
 *
 * The function is responsible for billing a patient and calculating the total
 * due on their invoice.  It will create a record in the `sale` table.
 *
 * Up to three additional tables may be affected:
 *  1. `sale_items`
 *  2. `sale_billing_service`
 *  3. `sale_subsidy`
 *
 * The invoicing procedure of a patient's total invoice goes like this:
 *  1. First, the total sum of the sale items are recorded as sent from the
 *  client.  The Patient Invoice module is allowed to edit the item costs as it
 *  sees fit, so we use the POSTed costs.
 *  2. Next, each billing service is added to the invoice by writing records to
 *  the `sale_billing_service` table.  The cost of each billing service is
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
  let sale = req.body.sale;
  let items = sale.items || [];

  /**
   * @todo - the client should only send back an array of ids for the billing
   * services and subsidies.  We have to look them up anyway, so might as well
   * save HTTP bandwidth.
   */
  let billingServices = [];
  if (sale.billingServices && sale.billingServices.items) {
    billingServices = sale.billingServices.items;
  }

  let subsidies = [];
  if (sale.subsidies && sale.subsidies.items) {
    subsidies = sale.subsidies.items;
  }

  // remove the unused properties on sale object before insertion to the
  // database
  delete sale.items;
  delete sale.billingServices;
  delete sale.subsidies;

  // provide UUID if the client has not specified
  sale.uuid = db.bid(sale.uuid || uuid.v4());

  // make sure that the dates have been properly transformed before insert
  if (sale.date) {
    sale.date = new Date(sale.date);
  }

  /** @todo - abstract this into a generic "convert" method */
  if (sale.debtor_uuid) {
    sale.debtor_uuid = db.bid(sale.debtor_uuid);
  }

  // implicitly provide user information based on user session
  sale.user_id = req.session.user.id;

  // properly convert UUIDs and link sale to sale components.
  items = processSaleItems(sale, items);
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

  let insertSaleQuery =
    'INSERT INTO sale SET ?';

  let insertSaleItemQuery =
    `INSERT INTO sale_item (uuid, inventory_uuid, quantity,
        transaction_price, inventory_price, debit, credit, sale_uuid) VALUES ?;`;

  let itemSumCost  = `
    SET @totalItemsCost = (
      SELECT SUM(credit) AS cost FROM sale_item WHERE sale_uuid = ?
    );
  `;

  let insertSaleBillingServicesQuery = `
    INSERT INTO sale_billing_service (sale_uuid, value, billing_service_id)
    SELECT ?, (billing_service.value / 100) * @totalItemsCost, billing_service.id
    FROM billing_service WHERE id IN (?);
  `;

  let billingSumCost =  `
    SET @billingSumCost = (
      SELECT SUM(value) AS value FROM sale_billing_service WHERE sale_uuid = ?
    );
  `;

  let combinedSumCost = `
    SET @combinedSumCost = @totalItemsCost + IFNULL(@billingSumCost, 0);
  `;

  let insertSaleSubsidyQuery = `
    INSERT INTO sale_subsidy (sale_uuid, value, subsidy_id)
    SELECT ?, (subsidy.value / 100) * @totalItemsCost, subsidy.id
    FROM subsidy WHERE id IN (?);
  `;

  let subsidySumCost = `
    SET @subsidySumCost = (
      SELECT SUM(value) AS value from sale_subsidy WHERE sale_uuid = ?
    );
  `;

  let finalSumCost = `
    SET @finalSumCost = @combinedSumCost - IFNULL(@subsidySumCost, 0);
  `;

  let updateSaleCostQuery = `
    UPDATE sale SET cost = @finalSumCost WHERE uuid = ?;
  `;

  transaction = db.transaction();

  // insert sale line
  transaction
    .addQuery(insertSaleQuery, [sale])

  // insert sale item lines
    .addQuery(insertSaleItemQuery, [items])

  // calculate total cost
    .addQuery(itemSumCost, [sale.uuid]);

  // if there are billing services, apply them to the bill
  if (billingServices.length) {
    transaction

    // insert the billing services
      .addQuery(insertSaleBillingServicesQuery, [sale.uuid, billingServices])

    // calculate the combined charge
      .addQuery(billingSumCost, [sale.uuid]);
  }

  // calculate the new sum of the sale
  transaction
    .addQuery(combinedSumCost);

  // if there are subsidies, insert them
  if (subsidies.length) {
    transaction
      .addQuery(insertSaleSubsidyQuery, [sale.uuid, subsidies])

      .addQuery(subsidySumCost, [sale.uuid]);
  }

  // make sure that the final computation of costs is correct.
  transaction
    .addQuery(finalSumCost)

  // update the original sale with the cost
    .addQuery(updateSaleCostQuery, [sale.uuid]);

  journal(transaction, sale.uuid)
    .then(function () {
      res.status(201).json({
        uuid : uuid.unparse(sale.uuid)
      });
    })
    .catch(next)
    .done();
}

/**
 * Searches for a sale by query parameters provided.
 *
 * GET /sales/search
 */
function search(req, res, next) {
  let sql =
    `SELECT BUID(sale.uuid) as uuid, sale.project_id, CONCAT(project.abbr, sale.reference) AS reference,
      sale.cost, BUID(sale.debtor_uuid) as debtor_uuid, sale.user_id, sale.discount,
      sale.date, sale.is_distributable
    FROM sale JOIN project ON project.id = sale.project_id `;

  if (req.query.debtor_uuid) {
    req.query.debtor_uuid = db.bid(req.query.debtor_uuid);
  }

  if (req.query.uuid) {
    req.query.uuid = db.bid(req.query.uuid);
  }

  let queryObject = util.queryCondtion(sql, req.query);

  db.exec(queryObject.query, queryObject.conditions)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
 * Searches for a particular sale uuid by reference string.
 *
 * NOTE - this cannot be combined with the /search route since it would require
 * wrapping a MySQL query in an outer query to do the filtering.  This would be
 * highly inefficient in most cases, or lead to complex code.
 *
 * GET sales/references/:reference
 */
function reference(req, res, next) {
  let sql =
    `SELECT BUID(s.uuid) as uuid FROM (
      SELECT sale.uuid, CONCAT(project.abbr, sale.reference) AS reference
      FROM sale JOIN project ON sale.project_id = project.id
    )s WHERE s.reference = ?;`;

  db.exec(sql, [ req.params.reference ])
  .then(function (rows) {
    if (!rows.length) {
      throw new NotFound(`Could not find a sale with reference ${req.params.reference}`);
    }

    // references should be unique -- send back only the first result
    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
}
