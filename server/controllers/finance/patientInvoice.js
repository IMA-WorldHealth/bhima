/**
 * Patient Invoice API Controller
 *.@module controllers/finance/patientInvoice
 *
 * @todo (required) Major bug - Sale items are entered based on order or attributes sent from client - this doesn't seem to be consistent as of 2.X
 * @todo GET /sales/patient/:uuid - retrieve all patient invoices for a specific patient
 * @todo Factor in subsidies, this depends on price lists and billing services infrastructre
 * @todo Credit note logic pending on clear design
 */
var q    = require('q');
var db   = require('../../lib/db');
var uuid = require('node-uuid');
var _    = require('lodash');
var util = require('../../lib/util');

var journal = require('./journal');

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
  var saleItems = req.body.sale && req.body.sale.items;

  // TODO Billing service + subsidy posting journal interface
  // Billing services and subsidies are sent from the client, the client
  // has calculated the charge associated with each subsidy and billing service
  // - the financial posting logic depends on the future posting journal logic,
  // it must be decided if the server will have the final say in the cost calculation
  var billingServices = req.body.billingServices;
  var subsidies = req.body.subsidies;

  // make sure that the dates have been properly transformed before insert
  if (saleLineBody.invoice_date) {
    saleLineBody.invoice_date = new Date(saleLineBody.invoice_date);
  }

  // Reject invalid parameters
  if (!saleLineBody || !saleItems) {
    res.status(400).json({
      code : 'ERROR.ERR_MISSING_INFO',
      reason : 'A valid sale details and sale items must be provided under the attributes `sale` and `saleItems`'
    });
    return;
  }

  // remove the unused properties on sale
  delete req.body.sale.items;

  // provide UUID if the client has not specified
  saleLineBody.uuid = saleLineBody.uuid || uuid.v4();

  // implicitly provide seller information based on user session
  saleLineBody.seller_id = req.session.user.id;

  // make sure that sale items have their uuids
  saleItems.map(function (item) {
    item.uuid = item.uuid || uuid.v4();
    item.sale_uuid = saleLineBody.uuid;
  });

  // create a filter to align sale item columns
  var filter =
    util.take('uuid', 'inventory_uuid', 'quantity', 'transaction_price', 'inventory_price', 'debit', 'credit', 'sale_uuid');

  // prepare sale items for insertion into database
  var items = _.map(saleItems, filter);

  insertSaleLineQuery =
    'INSERT INTO sale SET ?';

  insertSaleItemQuery =
    'INSERT INTO sale_item (uuid, inventory_uuid, quantity, ' +
        'transaction_price, inventory_price, debit, credit, sale_uuid) VALUES ?';


  transaction = db.transaction();

  // Insert sale line
  transaction
    .addQuery(insertSaleLineQuery, [saleLineBody])

  // Insert sale item lines
    .addQuery(insertSaleItemQuery, [items]);

  transaction.execute()
    .then(function (results) {
      saleResults = results;

      // TODO Update to use latest journal interface
      return postSaleRecord(saleLineBody.uuid, req.body.caution, req.session.user.id);
    })
    .then(function (results) {
      res.status(201).json({
        uuid :saleLineBody.uuid
      });
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
 * Searches for a sale by query parameters provided.
 *
 * GET sales/search
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
  'use strict';

  var sql =
    'SELECT s.uuid FROM (' +
      'SELECT sale.uuid, CONCAT(project.abbr, sale.reference) AS reference ' +
      'FROM sale JOIN project ON sale.project_id = project.id ' +
    ')s WHERE s.reference = ?;';

  db.exec(sql, [ req.params.reference ])
  .then(function (rows) {
    if (rows.length === 0) {
      throw new req.codes.ERR_NOT_FOUND();
    }

    // references should be unique -- send back only the first result
    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
}
