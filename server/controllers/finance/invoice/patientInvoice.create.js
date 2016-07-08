/**
 * Patient Invoice - Create State
 * @module controllers/finance/patientInvoice
 *
 * This module is only responsible for preparing a series of MySQL commands
 * (transaction) that will be executed by the API handler, error and results
 * will be propegated through to the client.
 */
const db = require('../../../lib/db');
const uuid = require('node-uuid');
const util = require('../../../lib/util');
const _ = require('lodash');

module.exports = createInvoice;

// this expects unfiltered objects passed from the client
// details should contain
// - invoice items
// - billing services information
// - subisidies information
function createInvoice(details) {
  let transaction = db.transaction();
  let invoice = details;
  let items = invoice.items || [];

  let billingServices = [];
  if (invoice.billingServices) {
    billingServices = invoice.billingServices;
  }

  let subsidies = [];
  if (invoice.subsidies) {
    subsidies = invoice.subsidies;
  }

  invoice.uuid = db.bid(invoice.uuid || uuid.v4());

  if (invoice.date) {
    invoice.date = new Date(invoice.date);
  }

  /** @todo - abstract this into a generic "convert" method */
  if (invoice.debtor_uuid) {
    invoice.debtor_uuid = db.bid(invoice.debtor_uuid);
  }

  // properly convert UUIDs and link invoice to invoice components.
  items = processInvoiceItems(invoice, items);
  /** @todo - remove these maps, since we'll send back an array of ids */

  /** @todo - invoice id is no longer needed here */
  billingServices = billingServices.map(function (billingService) {
    return [
    billingService.billing_service_id,
    invoice.uuid
    ];
  });
  subsidies = subsidies.map(function(subsidy) {
    return [
    subsidy.subsidy_id,
    invoice.uuid
    ];
  });

  delete invoice.items;
  delete invoice.billingServices;
  delete invoice.subsidies;

  let params = Object.keys(invoice).map(function (key) { return invoice[key]; });

  transaction.addQuery('CALL StageInvoice(?)', [params]);

  items.forEach(item =>
        transaction.addQuery('CALL StageInvoiceItem(?)', [item]));

  /** @todo mutliple inserts during the staging process could have performance
   * implications on smaller data sets (larger seems to be more negligable), the
   * data that must be staged could be passed in through a string to be concatted
   * into a prepared statement */
  billingServices.forEach(billingService =>
      transaction.addQuery('CALL StageBillingService(?)', [billingService]));
  subsidies.forEach(subsidy =>
      transaction.addQuery('CALL StageSubsidy(?)', [subsidy]));

  transaction.addQuery('CALL WriteInvoice(?)', [invoice.uuid]);

  transaction.addQuery('CALL PostInvoice(?)', [invoice.uuid]);

  return transaction;
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


// 1. write invoice records
// 2. post invoice into the posting journal
function writeInvoiceRecord() {

}

function postInvoice() {

}

function prepareInvoice() {

}
