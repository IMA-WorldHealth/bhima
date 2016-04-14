/**
 * Patient Invoice API Controller
 *.@module controllers/finance/patientInvoice
 *
 * @todo (required) major bug - Sale items are entered based on order or attributes sent from client - this doesn't seem to be consistent as of 2.X
 * @todo GET /sales/patient/:uuid - retrieve all patient invoices for a specific patient
 * @todo Factor in subsidies, this depends on price lists and billing services infrastructre
 * @todo Credit note logic pending on clear design
 */
var q    = require('q');
var db   = require('../../lib/db');
const uuid = require('node-uuid');
var _    = require('lodash');
var util = require('../../lib/util');

var journal = require('./journal');
var NotFound = require('../../lib/errors/NotFound');

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
    'SELECT CONCAT(project.abbr, sale.reference) AS reference, BUID(sale.uuid) as uuid, cost,' +
      'BUID(sale.debtor_uuid) as debtor_uuid, user_id, date, is_distributable ' +
    'FROM sale ' +
      'LEFT JOIN patient ON sale.debtor_uuid = patient.debtor_uuid ' +
      'JOIN project ON sale.project_id = project.id;';

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
 * @param {string} uid - the uuid of the sale in question
 */
function lookupSale(uid) {
  'use strict';

  var record;

  var saleDetailQuery =
    'SELECT BUID(sale.uuid) as uuid, CONCAT(project.abbr, sale.reference) AS reference, sale.cost, ' +
      'BUID(sale.debtor_uuid) AS debtor_uuid, CONCAT(patient.first_name, " ", patient.last_name) AS debtor_name, ' +
      'user_id, discount, date, sale.is_distributable ' +
    'FROM sale ' +
    'LEFT JOIN patient ON patient.debtor_uuid = sale.debtor_uuid ' +
    'JOIN project ON project.id = sale.project_id ' +
    'WHERE sale.uuid = ?';

  var saleItemsQuery =
    'SELECT BUID(sale_item.uuid) as uuid, sale_item.quantity, sale_item.inventory_price, ' +
      'sale_item.transaction_price, inventory.code, inventory.text, inventory.consumable ' +
    'FROM sale_item ' +
    'LEFT JOIN inventory ON sale_item.inventory_uuid = inventory.uuid ' +
    'WHERE sale_uuid = ?';

  return db.exec(saleDetailQuery, [uid])
    .then(function (rows) {
      if (rows.length === 0) {
        throw new NotFound(`Could not find an Inventory with uuid ${uuid.unparse(uid)}`);
      }

      record = rows[0];
      return db.exec(saleItemsQuery, [uid]);
    })
    .then(function (rows) {
      record.items = rows;
      return record;
    });
}

/**
 * @todo Read the balance remaining on the debtors account given the sale as an auxillary step
 */
function details(req, res, next) {
  var uid = db.bid(req.params.uuid);

  lookupSale(uid)
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}

function create(req, res, next) {
  'use strict';

  var insertSaleQuery, insertSaleItemQuery;
  var transaction;

  var sale = req.body.sale;
  var items = sale.items || [];

  // TODO Billing service + subsidy posting journal interface
  // Billing services and subsidies are sent from the client, the client
  // has calculated the charge associated with each subsidy and billing service
  // - the financial posting logic depends on the future posting journal logic,
  // it must be decided if the server will have the final say in the cost calculation
  var billingServices = sale.billingServices || [];
  var subsidies = sale.subsidies || [];

  // remove the unused properties on sale
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
  var filter =
    util.take('uuid', 'inventory_uuid', 'quantity', 'transaction_price', 'inventory_price', 'debit', 'credit', 'sale_uuid');

  // prepare sale items for insertion into database
  items = _.map(items, filter);

  insertSaleQuery =
    'INSERT INTO sale SET ?';

  insertSaleItemQuery =
    'INSERT INTO sale_item (uuid, inventory_uuid, quantity, ' +
        'transaction_price, inventory_price, debit, credit, sale_uuid) VALUES ?';

  transaction = db.transaction();

  // insert sale line
  transaction
    .addQuery(insertSaleQuery, [ sale ])

  // insert sale item lines
    .addQuery(insertSaleItemQuery, [ items ]);

  transaction.execute()
    .then(function () {

      /** @todo Update to use latest journal interface */
      return postSaleRecord(sale.uuid, req.body.caution, req.session.user.id);
    })
    .then(function (results) {
      res.status(201).json({
        uuid : uuid.unparse(sale.uuid)
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
 *
 * @todo/@fixme - make this work!
 */
function postSaleRecord(saleUuid, caution, userId) {
  var deferred = q.defer();

  journal.request('sale', saleUuid, userId, function (error, result) {
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
    'SELECT BUID(sale.uuid) as uuid, sale.project_id, CONCAT(project.abbr, sale.reference) AS reference, ' +
      'sale.cost, BUID(sale.debtor_uuid) as debtor_uuid, sale.user_id, sale.discount, ' +
      'sale.date, sale.is_distributable ' +
    'FROM sale JOIN project ON project.id = sale.project_id ' +
    'WHERE ';

  var conditions = [];

  if (req.query.debtor_uuid) {
    req.query.debtor_uuid = db.bid(req.query.debtor_uuid);
  }

  if (req.query.uuid) {
    req.query.uuid = db.bid(req.query.uuid);
  }

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
    'SELECT BUID(s.uuid) as uuid FROM (' +
      'SELECT sale.uuid, CONCAT(project.abbr, sale.reference) AS reference ' +
      'FROM sale JOIN project ON sale.project_id = project.id ' +
    ')s WHERE s.reference = ?;';

  db.exec(sql, [ req.params.reference ])
  .then(function (rows) {
    if (rows.length === 0) {
      throw new NotFound(`Could not find a sale with reference ${req.params.reference}`);
    }

    // references should be unique -- send back only the first result
    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
}
