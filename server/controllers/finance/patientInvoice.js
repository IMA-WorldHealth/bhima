/**
 * Patient Invoice API Controller
 *.@module controllers/finance/patientInvoice
 *
 * @todo GET /sales/patient/:uuid - retrieve all patient invoices for a specific patient
 * @todo Factor in subsidies, this depends on price lists and billing services infrastructre
 * @todo Credit note logic pending on clear design
 */
var q    = require('q');
var db   = require('../../lib/db');
var uuid = require('../../lib/guid');
var _    = require('lodash');

var journal = require('./journal');

/** Retrieves a list of all patient invoices (accepts ?q delimiter). */
exports.list = list;

/** Retrieves details for a specific patient invoice. */
exports.details = details;

/** Write a new patient invoice record and attempt to post it to the journal. */
exports.create = create;

/** Filter the patient table by any column via query strings */
exports.search = search;

/** Undo the financial effects of a sale generating an equal and opposite credit note. */
// exports.reverse = reverse;

function list(req, res, next) {
  var saleListQuery;

  saleListQuery =
    'SELECT sale.project_id, sale.reference, sale.uuid, cost, sale.debitor_uuid, ' +
      'seller_id, invoice_date, is_distributable ' +
    'FROM sale ' +
    'LEFT JOIN patient ON sale.debitor_uuid = patient.debitor_uuid';

  db.exec(saleListQuery)
    .then(function (result) {
      var sales = result;

      res.status(200).json(sales);
    })
    .catch(next)
    .done();
}

/**
 * @todo Read the balance remaining on the debtors account given the sale as an auxillary step
 */
function details(req, res, next) {
  var saleDetailQuery, saleItemsQuery;
  var sale, saleItems;
  var uuid = req.params.uuid;

  saleDetailQuery =
    'SELECT sale.uuid, sale.project_id, sale.reference, sale.cost, sale.currency_id, ' +
      'sale.debitor_uuid, CONCAT(patient.first_name, " ", patient.last_name) as debitor_name, ' +
      'seller_id, discount, invoice_date, sale.note, sale.posted, sale.is_distributable ' +
    'FROM sale ' +
    'LEFT JOIN patient ON patient.debitor_uuid = sale.debitor_uuid ' +
    'WHERE sale.uuid = ?';

  saleItemsQuery =
    'SELECT sale_item.uuid, sale_item.quantity, sale_item.inventory_price, ' +
      'sale_item.transaction_price, inventory.code, inventory.text, inventory.consumable ' +
    'FROM sale_item ' +
    'LEFT JOIN inventory ON sale_item.inventory_uuid = inventory.uuid ' +
    'WHERE sale_uuid = ?';

  // This process accepts a very small performance hit querrying the sale items
  // even if the sale hasn't been found - however it uses a less obscure branching
  // structure than alternative blocking methods
  db.exec(saleDetailQuery, [uuid])
    .then(function (detailsResult) {
      sale = detailsResult;
      return db.exec(saleItemsQuery, [uuid]);
    })
    .then(function (itemsResult) {
      saleItems = itemsResult;

      if (_.isEmpty(sale)) {
        res.status(404).json({
          code : 'ERR_NOT_FOUND',
          reason : 'No sale found under the id ' + uuid
        });
      } else {

        // Found sale resource - unpack and return to client
        sale = sale[0];
        res.status(200).json({
          sale : sale,
          saleItems : saleItems
        });
      }
    })
    .catch(next)
    .done();
}

function create(req, res, next) {
  var insertSaleLineQuery, insertSaleItemQuery;
  var saleResults;
  var transaction;

  // Verify request validity
  var saleLineBody = req.body.sale;
  var saleItems = req.body.saleItems;

  // Reject invalid parameters
  if (!saleLineBody || !saleItems) {
    res.status(400).json({
      code : 'ERROR.ERR_MISSING_INFO',
      reason : 'A valid sale details and sale items must be provided under the attributes `sale` and `saleItems`'
    });
    return;
  }

  // Provide UUID if the client has not specified
  saleLineBody.uuid = saleLineBody.uuid || uuid();

  // Implicitly provide seller information based on user session
  saleLineBody.seller_id = req.session.user.id;

  insertSaleLineQuery =
    'INSERT INTO sale SET ?';

  insertSaleItemQuery =
    'INSERT INTO sale_item (inventory_uuid, quantity, inventory_price, ' +
        'transaction_price, credit, debit, uuid,  sale_uuid) VALUES ?';

  transaction = db.transaction();

  // Insert sale line
  transaction
    .addQuery(insertSaleLineQuery, [saleLineBody])

  // Insert sale item lines
    .addQuery(insertSaleItemQuery, [linkSaleItems(saleItems, saleLineBody.uuid)]);

  transaction.execute()
    .then(function (results) {
      saleResults = results;

      // TODO Update to use latest journal interface
      return postSaleRecord(saleLineBody.uuid, req.body.caution, req.session.user.id);
    })
    .then(function (results) {
      var confirmation = {
        uuid : saleLineBody.uuid,
        results : saleResults
      };
      res.status(201).json(confirmation);
    })
    .catch(next)
    .done();
}

/**
 * @deprecated since version 2.X
 * Wrapper method to allow the module to use the current journal
 * interface. This will be replaced with the new server journal interface
 * implementation.
 * @returns {Object} Promise object to be fulfilled on journal posting
 */
function postSaleRecord(saleUuid, caution, userId) {
  var deferred = q.defer();

  journal.request('sale', saleUuid, userId, function (error, result) {
    if (error) {
      return deferred.reject(error);
    }
    return deferred.resolve(result);
  }, caution);
  return deferred.promise;
}

/**
 * Utility method to ensure patient invoice lines reference sale.
 * @param {Object} saleItems - An Array of all sale items to be written
 * @param {string} saleUuid - UUID of referenced patient invoice
 * @returns {Object} An Array of all sale items with guaranteed UUIDs and Patient Invoice references
 */
function linkSaleItems(saleItems, saleUuid) {
  return saleItems.map(function (saleItem) {

    saleItem.uuid = saleItem.uuid || uuid();
    saleItem.sale_uuid = saleUuid;

    // Collapse sale item into Array to be inserted into database
    return Object.keys(saleItem).map(function (key) {
      return saleItem[key];
    });
  });
}

/**
 * Searches for a sale by query parameters provided.
 */
function search(req, res, next) {
  'use strict';

  var sql =
    'SELECT sale.uuid, sale.project_id, CONCAT(project.abbr, sale.reference) AS reference, ' +
      'sale.cost, sale.currency_id, sale.debitor_uuid, sale.seller_id, sale.discount, ' +
      'sale.invoice_date, sale.note, sale.posted, sale.is_distributable ' +
    'FROM sale JOIN project ON project.id = sale.project_id ' +
    'WHERE ';

  var conditions = [];

  // look through the query string and template their key/values to the SQL query
  var tmpl = Object.keys(req.query).map(function (key) {

    // add the key + value to the conditions array
    conditions = conditions.concat(key, req.query[key]);

    // return the template string
    return '?? = ?';
  });

  // if the client didn't send any data, simply search 'WHERE 1' to return all
  // results in the database.
  if (_.isEmpty(req.query)) {
    sql += '1';
  }

  // add in the WHERE conditions to the sql tempalte
  sql += tmpl.join(' AND ') + ';';

  db.exec(sql, conditions)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}
