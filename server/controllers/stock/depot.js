/**
* Depot Controller
*
* This controller is mostly responsible for depot-dependent stock queries.  Most
* routes require that a depot ID is specified.  Any route without a depot ID
* might be better positioned in the /inventory/ controller.
*/

var db = require('../../lib/db'),
    distributions = require('./depots/distributions');

// expose routes
exports.getDepots = getDepots;
exports.getDepotsById = getDepotsById;
exports.getDistributions = getDistributions;
exports.getDistributionsById = getDistributionsById;
exports.getAvailableLots = getAvailableLots;
exports.getAvailableLotsByInventoryId = getAvailableLotsByInventoryId;
exports.getExpiredLots = getExpiredLots;
exports.createDistributions = createDistributions;
exports.getStockExpirations = getStockExpirations;

/**
* GET /depots
* Fetches all depots in the database
*
* @function getDepots
*/
function getDepots(req, res, next) {
  'use strict';

  var sql;

  // TODO - should be filtered by enterprise.
  sql =
    'SELECT d.uuid, d.reference, d.text, d.is_warehouse ' +
    'FROM depot AS d ' +
    'WHERE d.enterprise_id = ?;';

  db.exec(sql, [req.session.enterprise.id])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
* GET /depots/:uuid
* Fetches a depot by its uuid from the database
*
* @function getDepotsById
*/
function getDepotsById(req, res, next) {
  'use strict';

  var sql,
      uuid = req.params.uuid;

  sql =
    'SELECT d.uuid, d.reference, d.text, d.is_warehouse ' +
    'FROM depot AS d ' +
    'WHERE d.enterprise_id = ? AND d.uuid = ?;';

  db.exec(sql, [req.session.enterprise.id, uuid])
  .then(function (rows) {

    // make sure we find at least one depot
    if (rows.length < 1) {
      return res.status(404).json({
        code : 'ERR_NO_DEPOT',
        reason : 'No depot was found matching the uuid:' + uuid
      });
    }

    // return the json
    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
}

/**
* GET /depots/:uuid/distributions
* Fetches distributions (equiv. consumptions) for the given depot uuid.  Allows
* the following query options:
*   start - start date
*   end   - end date
*   type  - type of distribution {service|patient|loss|rummage}. Defaults to
*           all distributions, regardless of type.
*
* NOTE - this query does not filter for uncanceled sales.  You will have to
* handle those yourselves in your controllers.
*
* @function getDistributions
*/
function getDistributions(req, res, next) {
  'use strict';

  var sql,
      options = req.query;

  // the sql executed depends on the type of consumption
  // defaults to all consumptions
  switch (options.type) {

    // filter on distributions to patients
    // TODO - this query is suboptimal.  Perhaps rewrite with multiple subqueries
    case 'patients':
    case 'patient':
      sql =
        'SELECT c.uuid, c.document_id, COUNT(c.document_id) AS total, ' +
          'p.uuid AS patientId, p.first_name, p.last_name, ' +
          'p.middle_name, d.text, d.uuid AS depotId, ' +
          'CONCAT(pr.abbr, p.reference) AS patient, c.date, i.text as label, ' +
          'sale.invoice, cp.sale_uuid AS saleId, c.canceled ' +
        'FROM consumption_patient AS cp ' +
        'JOIN consumption AS c ON c.uuid = cp.consumption_uuid ' +
        'JOIN patient AS p ON p.uuid = cp.patient_uuid ' +
        'JOIN project AS pr ON p.project_id = pr.id ' +
        'JOIN depot AS d ON d.uuid = c.depot_uuid ' +
        'JOIN stock AS s ON s.tracking_number = c.tracking_number ' +
        'JOIN inventory AS i ON i.uuid = s.inventory_uuid ' +
        'JOIN (' +
          'SELECT sale.uuid, CONCAT(project.abbr, sale.reference) AS invoice ' +
          'FROM sale JOIN project ON ' +
            'sale.project_id = project.id' +
        ') AS sale ON sale.uuid = c.document_id ' +
        'WHERE d.uuid = ? AND c.date BETWEEN DATE(?) AND DATE(?) ' +
        'GROUP BY c.document_id ' +
        'ORDER BY c.date DESC, p.first_name ASC, p.last_name ASC;';
      break;

    // get distributions to services
    case 'services':
    case 'service':
      sql =
        'SELECT c.uuid, c.document_id, COUNT(c.document_id) AS total, ' +
        'cs.service_id, service.name, c.date, d.text, d.uuid AS depotId, ' +
        'i.text AS label, c.canceled ' +
        'FROM consumption_service AS cs ' +
        'JOIN consumption AS c ON c.uuid = cs.consumption_uuid ' +
        'JOIN service ON service.id = cs.service_id ' +
        'JOIN depot AS d ON d.uuid = c.depot_uuid ' +
        'JOIN stock ON stock.tracking_number = c.tracking_number ' +
        'JOIN inventory AS i ON i.uuid = stock.inventory_uuid ' +
        'WHERE d.uuid = ? AND c.date BETWEEN DATE(?) AND DATE(?) ' +
        'GROUP BY c.document_id ' +
        'ORDER BY c.date DESC, service.name ASC;';
      break;

    // TODO - this should find all consumption rummages for this depot
    case 'rummage':
      sql =
        'SELECT c.uuid, cr.document_uuid AS voucher, ' +
          'COUNT(c.document_id) AS total, c.date, d.text, d.uuid AS depotId, ' +
          'i.text AS label, c.canceled ' +
        'FROM consumption_rummage AS cr ' +
        'JOIN consumption AS c ON c.uuid = cr.consumption_uuid ' +
        'JOIN depot AS d ON d.uuid = c.depot_uuid ' +
        'JOIN stock ON stock.tracking_number = c.tracking_number ' +
        'JOIN inventory AS i ON i.uuid = stock.inventory_uuid ' +
        'WHERE d.uuid = ? AND c.date BETWEEN DATE(?) AND DATE(?) ' +
        'GROUP BY c.document_id ' +
        'ORDER BY c.date DESC;';
      break;

    // TODO - this should find all consumption losses for this depot
    case 'loss' :
    case 'losses':
      sql =
        'SELECT c.uuid, c.document_id AS voucher, ' +
          'COUNT(c.document_id) AS total, c.date, d.text, d.uuid AS depotId, ' +
          'i.text AS label, c.canceled ' +
        'FROM consumption_loss AS cl ' +
        'JOIN consumption AS c ON c.uuid = cl.consumption_uuid ' +
        'JOIN depot AS d ON d.uuid = c.depot_uuid ' +
        'JOIN stock AS s ON s.tracking_number = c.tracking_number ' +
        'JOIN inventory AS i ON i.uuid = s.inventory_uuid ' +
        'WHERE d.uuid = ? AND c.date BETWEEN DATE(?) AND DATE(?) ' +
        'GROUP BY c.document_id ' +
        'ORDER BY c.date DESC;';
      break;

    // TODO - this should find all consumptions for this depot
    default:
      sql =
        'SELECT c.uuid, SUM(c.quantity) AS quantity, SUM(c.unit_price) AS price, ' +
          'COUNT(c.document_id) AS total, c.date, d.text, ' +
          'd.uuid AS depotId, i.text AS label, c.canceled ' +
        'FROM consumption AS c ' +
        'JOIN depot AS d ON d.uuid = c.depot_uuid ' +
        'JOIN stock AS s ON s.tracking_number = c.tracking_number ' +
        'JOIN inventory AS i ON i.uuid = s.inventory_uuid ' +
        'WHERE d.uuid = ? AND c.date BETWEEN DATE(?) AND DATE(?) ' +
        'GROUP BY c.document_id ' +
        'ORDER BY c.date DESC;';
      break;
  }

  db.exec(sql, [req.params.depotId, options.start, options.end])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

function getDistributionsById(req, res, next) {
  'use strict';

  var sql,
      uuid = req.params.uuid;

  sql =
    'SELECT c.uuid, c.document_id, c.date, d.text AS depotName, ' +
      'd.uuid AS depotId, c.quantity, i.text AS label, c.canceled ' +
    'FROM consumption AS c ' +
    'JOIN depot AS d ON d.uuid = c.depot_uuid ' +
    'JOIN stock AS s ON s.tracking_number = c.tracking_number ' +
    'JOIN inventory AS i ON i.uuid = s.inventory_uuid ' +
    'WHERE d.uuid = ? AND c.uuid = ?' +
    'ORDER BY c.date DESC;';

  db.exec(sql, [req.params.depotId, uuid])
  .then(function (rows) {
    if (!rows) {
      return res.status(404).json({
        code : 'ERR_NO_CONSUMPTION',
        reason : 'Could not find a consumption by uuid: ' + uuid
      });
    }

    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
* POST /depots/:depotId/distributions
*
* Creates a new distribution for services, patients, etc.
*/
function createDistributions(req, res, next) {
  'use strict';

  // FIXME
  // We need a better way of passing the project ID into the requests,
  // preferably giving access to the entire session variable.
  distributions.createDistributions(req.params.depotId, req.body, req.session)
  .then(function (data) {
    res.status(200).json(data);
  })

  // FIXME -- this needs better error handling, I think.
  .catch(next)
  .done();
}

/**
* GET /depots/:depotId/inventory
* This function returns all the lots in a given depot for all inventory items
* in the inventory.
*
* @function getAvailableLots
*/
function getAvailableLots(req, res, next) {
  'use strict';

  var sql,
      depot = req.params.depotId;

  sql =
    'SELECT unit_price, tracking_number, lot_number, SUM(quantity) AS quantity, code, label, expiration_date FROM ' +
    '(SELECT purchase_item.unit_price, stock.tracking_number, stock.lot_number, (consumption.quantity * -1) as quantity, inventory.code, inventory.text AS label, stock.expiration_date FROM ' +
    'consumption JOIN stock ON consumption.tracking_number = stock.tracking_number JOIN inventory ON inventory.uuid = stock.inventory_uuid ' +
    'JOIN purchase_item ON purchase_item.purchase_uuid = stock.purchase_order_uuid AND purchase_item.inventory_uuid = stock.inventory_uuid  ' +
    'WHERE consumption.canceled = 0 AND depot_uuid = ? ' +
    'UNION ALL ' +
    'SELECT purchase_item.unit_price, stock.tracking_number, stock.lot_number, (CASE WHEN movement.depot_entry= ? THEN movement.quantity ELSE movement.quantity*-1 END) AS quantity, ' +
    'inventory.code, inventory.text AS label, stock.expiration_date FROM movement JOIN stock ON movement.tracking_number = stock.tracking_number JOIN inventory ' +
    'ON inventory.uuid = stock.inventory_uuid JOIN purchase_item ON purchase_item.purchase_uuid = stock.purchase_order_uuid AND purchase_item.inventory_uuid = stock.inventory_uuid ' +
    'WHERE movement.depot_entry= ? OR movement.depot_exit= ?) ' +
    'AS t GROUP BY tracking_number;';

  return db.exec(sql, [depot, depot, depot, depot])
  .then(function (rows) {

    // @TODO -- this should be in the WHERE/HAVING condition
    var ans = rows.filter(function (item){ return item.quantity > 0; });
    res.status(200).json(ans);
  })
  .catch(next)
  .done();
}

/**
* GET /depots/:depotId/inventory/:uuid
* This function returns all the lots in a given depot for a given inventory
* item, identified by an inventory code.
*
* TODO -- this should change to a UUID.
*
* @function getAvailableLotsByInventoryId
*/
function getAvailableLotsByInventoryId(req, res, next) {
  'use strict';

  var sql,
      depot = req.params.depotId,
      uuid = req.params.uuid;
      sql =
        'SELECT tracking_number, lot_number, SUM(quantity) AS quantity, code, expiration_date FROM ' +
        '(SELECT stock.tracking_number, stock.lot_number, (consumption.quantity * -1) as quantity, inventory.code, stock.expiration_date FROM ' +
        'consumption JOIN stock ON consumption.tracking_number = stock.tracking_number JOIN inventory ON inventory.uuid = stock.inventory_uuid ' +
        'WHERE consumption.canceled = 0 AND depot_uuid = ? AND inventory.uuid = ? ' +
        'UNION ALL ' +
        'SELECT stock.tracking_number, stock.lot_number, (CASE WHEN movement.depot_entry= ? THEN movement.quantity ELSE movement.quantity*-1 END) AS quantity, ' +
        'inventory.code, stock.expiration_date FROM movement JOIN stock ON movement.tracking_number = stock.tracking_number JOIN inventory ' +
        'ON inventory.uuid = stock.inventory_uuid WHERE (movement.depot_entry= ? OR movement.depot_exit= ?) AND inventory.uuid= ?) ' +
        'AS t GROUP BY tracking_number;';

  return db.exec(sql, [depot, uuid, depot, depot, depot, uuid])
  .then(function (rows) {

    // @TODO -- this should be in the WHERE/HAVING condition
    var ans = rows.filter(function (item){ return item.quantity > 0; });
    res.status(200).json(ans);
  })
  .catch(next)
  .done();
}

/**
* GET /depot/:uuid/expired
* Finds expiring drugs for a particular depot identified by depotId
*
* @function getExpiredLots
*/
function getExpiredLots(req, res, next) {
  'use strict';

  var sql,
      depot = req.params.depotId;

  sql =
    'SELECT s.tracking_number, s.lot_number, s.quantity, s.code, s.expiration_date FROM (' +
      'SELECT stock.tracking_number, stock.lot_number, outflow.depot_entry, outflow.depot_exit, ' +
        'SUM(CASE WHEN outflow.depot_entry = ? THEN outflow.quantity ELSE -outflow.quantity END) AS quantity, ' +
        'stock.expiration_date, inventory.code ' +
      'FROM inventory JOIN stock JOIN (' +
        'SELECT uuid, depot_entry, depot_exit, tracking_number, quantity, date ' +
        'FROM movement ' +
        'UNION ' +
        'SELECT uuid, null AS depot_entry, depot_uuid AS depot_exit, tracking_number, quantity, date  ' +
        'FROM consumption ' +
        'WHERE consumption.canceled = 0' +
      ') AS outflow ON ' +
        'inventory.uuid = stock.inventory_uuid AND ' +
        'stock.tracking_number = outflow.tracking_number ' +
      'WHERE stock.expiration_date <= CURDATE() AND (outflow.depot_entry = ? OR outflow.depot_exit = ?) ' +
      'GROUP BY stock.tracking_number' +
    ') AS s ' +
    'WHERE s.quantity > 0;';

  db.exec(sql, [depot, depot, depot])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
* GET /depots/:uuid/expirations?start={}&end={}
* This function returns all lots that will expire in a given depot between the
* provided dates.
*
* @function getStockExpirations
*/
function getStockExpirations(req, res, next) {
  'use strict';

  var sql,
      depot = req.params.depotId,
      options = req.query;

  sql =
    'SELECT s.tracking_number, s.lot_number, s.quantity, s.text, s.code, s.expiration_date FROM (' +
      'SELECT stock.tracking_number, stock.lot_number, outflow.depot_entry, outflow.depot_exit, ' +
        'SUM(CASE WHEN outflow.depot_entry = ? THEN outflow.quantity ELSE -outflow.quantity END) AS quantity, ' +
        'stock.expiration_date, inventory.code, inventory.text ' +
      'FROM inventory JOIN stock JOIN (' +
        'SELECT uuid, depot_entry, depot_exit, tracking_number, quantity, date ' +
        'FROM movement ' +
        'UNION ' +
        'SELECT uuid, null AS depot_entry, depot_uuid AS depot_exit, tracking_number, quantity, date  ' +
        'FROM consumption ' +
        'WHERE consumption.canceled = 0' +
      ') AS outflow ON ' +
        'inventory.uuid = stock.inventory_uuid AND ' +
        'stock.tracking_number = outflow.tracking_number ' +
      'WHERE (outflow.depot_entry = ? OR outflow.depot_exit = ?) AND ' +
        'stock.expiration_date BETWEEN DATE(?) AND DATE(?) ' +
      'GROUP BY stock.tracking_number ' +
    ') AS s ' +
    'WHERE s.quantity > 0;'; // filter out quantity = 0 from expiration report

  // TODO -- should the quantity = 0 filter be a HAVING clause?  Will that be
  // more performant?

  db.exec(sql, [depot, depot, depot, req.query.start, req.query.end])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}
