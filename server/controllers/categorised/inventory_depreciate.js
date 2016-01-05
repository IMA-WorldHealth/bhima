var db = require('./../../lib/db');
var sanitize = require('./../../lib/sanitize');

exports.getInventoryLot = function (req, res, next) {
  var sql = 'SELECT expiration_date, lot_number, tracking_number, quantity, code, uuid, text FROM stock, inventory WHERE inventory.uuid = stock.inventory_uuid AND stock.inventory_uuid='+sanitize.escape(req.params.inventory_uuid);
  db.exec(sql)
  .then(function (ans) {
    res.send(ans);
  })
  .catch(function (err) {
    next(err);
  })
  .done();
};

exports.stockIn = function (req, res, next) {
  var sql;
  var condition =
    'WHERE stock.expiration_date >= ' + sanitize.escape(req.params.df) + ' ' +
    'AND stock.expiration_date <= ' + sanitize.escape(req.params.dt);
  condition += (req.params.depot_uuid === '*') ? '' : ' AND consumption.depot_uuid = ' + sanitize.escape(req.params.depot_uuid) + ' ';

  if (req.params.depot_uuid === '*') {
    sql =
      'SELECT stock.inventory_uuid, stock.tracking_number, stock.lot_number, SUM(consumption.quantity) AS consumed, ' +
        'stock.expiration_date, stock.quantity as initial ' +
      'FROM stock LEFT JOIN consumption ON ' +
        'stock.tracking_number=consumption.tracking_number '+condition+
        'GROUP BY stock.tracking_number;';

  } else {
    sql =
      'SELECT stock.inventory_uuid, stock.tracking_number, '+
      'stock.lot_number, stock.quantity, SUM(consumption.quantity) AS consumed,'+
      'movement.quantity, ';
  }

  db.exec(sql)
  .then(function (ans) {
    res.send(ans);
  })
  .catch(function (err) {
    next(err);
  })
  .done();
};

exports.inventoryByDepot = function (req, res, next) {
  var sql = 'SELECT '+
            'distinct inventory.text, '+
            'inventory.uuid, '+
            'inventory.code '+
            'FROM stock JOIN inventory JOIN ON stock.inventory_uuid = inventory.uuid '+
            'WHERE stock.depot_uuid='+sanitize.escape(req.params.depot_uuid);

  db.exec(sql)
  .then(function (ans) {
    res.send(ans);
  })
  .catch(function (err) {
    next(err);
  })
  .done();
};

exports.listExpiredTimes = function (req, res, next) {
  var sql;
  if(req.query.request == 'expired'){
    sql = 'SELECT inventory.text, stock.lot_number, stock.tracking_number, stock.expiration_date, SUM(stock.quantity) AS quantity' +
        ' FROM stock' +
        ' JOIN inventory ON inventory.uuid = stock.inventory_uuid' +
        ' WHERE stock.expiration_date <= CURDATE()' +
        ' GROUP BY stock.tracking_number';

  } else if(req.query.request == 'expiredDellai'){
    sql = 'SELECT inventory.text, stock.lot_number, stock.tracking_number, stock.expiration_date,' +
        ' SUM(stock.quantity) AS quantity' +
        ' FROM stock JOIN inventory ON inventory.uuid = stock.inventory_uuid' +
        ' WHERE ((DATEDIFF(stock.expiration_date ,CURDATE()) > \'' + req.query.inf + '\')' +
        ' AND ((DATEDIFF(stock.expiration_date ,CURDATE()) <  \'' + req.query.sup + '\')))' +
        ' GROUP BY stock.tracking_number';
  } else if(req.query.request == 'oneYear'){
    sql = 'SELECT inventory.text, stock.lot_number, stock.tracking_number, stock.expiration_date,' +
        ' SUM(stock.quantity) AS quantity' +
        ' FROM stock JOIN inventory ON inventory.uuid = stock.inventory_uuid' +
        ' WHERE (DATEDIFF(stock.expiration_date ,CURDATE()) > \'365\')' +
        ' GROUP BY stock.tracking_number';
  }

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.listStockEntry = function (req, res, next) {
  var sql = 'SELECT stock.inventory_uuid, stock.entry_date, stock.tracking_number, SUM(stock.quantity) AS \'quantity\', inventory.text' +
          ' FROM stock' +
          ' JOIN inventory ON inventory.uuid = stock.inventory_uuid' +
          ' GROUP BY stock.inventory_uuid';

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.listStockConsumption = function (req, res, next) {
  var sql = 'SELECT inventory.text, SUM(consumption.quantity) AS \'quantity\', inventory.uuid, stock.inventory_uuid' +
          ' FROM consumption RIGHT JOIN stock ON stock.tracking_number = consumption.tracking_number' +
          ' JOIN inventory ON inventory.uuid = stock.inventory_uuid ' +
          ' GROUP BY stock.inventory_uuid';

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.listMonthlyConsumption = function (req, res, next) {
  var sql =
    'SELECT monthlyCons.uuid, monthlyCons.date, SUM(monthlyCons.quantity) AS quantity, monthlyCons.inventory_uuid ' +
    'FROM ( ' +
      'SELECT consumption.uuid, consumption.date, SUM(consumption.quantity) AS quantity, stock.inventory_uuid ' +
      ' FROM consumption ' +
      ' JOIN stock  ON stock.tracking_number = consumption.tracking_number ' +
      ' JOIN inventory ON inventory.uuid = stock.inventory_uuid ' +
      ' WHERE stock.inventory_uuid = ' + sanitize.escape(req.params.inventory_uuid) + ' AND ' +
      ' consumption.uuid NOT IN ( SELECT consumption_loss.consumption_uuid FROM consumption_loss ) ' +
      ' AND (consumption.date BETWEEN DATE_SUB(CURDATE(),INTERVAL ' + sanitize.escape(req.params.inventory_uuid) + ' MONTH) AND CURDATE())' +
      ' GROUP BY inventory.uuid ' +
    'UNION ' +
      'SELECT consumption_reversing.uuid, consumption_reversing.date, ((SUM(consumption_reversing.quantity)) * (-1)) AS quantity, stock.inventory_uuid ' +
      ' FROM consumption_reversing ' +
      ' JOIN stock  ON stock.tracking_number = consumption_reversing.tracking_number ' +
      ' JOIN inventory ON inventory.uuid = stock.inventory_uuid ' +
      ' WHERE stock.inventory_uuid = ' + sanitize.escape(req.params.inventory_uuid) + ' AND ' +
      ' consumption_reversing.consumption_uuid NOT IN ( SELECT consumption_loss.consumption_uuid FROM consumption_loss ) ' +
      ' AND (consumption_reversing.date BETWEEN DATE_SUB(CURDATE(),INTERVAL ' + sanitize.escape(req.params.inventory_uuid) + ' MONTH) AND CURDATE())' +
      ' GROUP BY inventory.uuid ) AS monthlyCons ';

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.listConsumptionByTrackingNumber = function (req, res, next) {
  var sql = 'SELECT consumption.tracking_number, SUM(consumption.quantity) AS \'quantity\'' +
          ' FROM consumption' +
          ' GROUP BY consumption.tracking_number';

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.formatLotsForExpiration = function (req, res, next) {
  var sql = 'SELECT s.tracking_number, s.lot_number, FLOOR(DATEDIFF(s.expiration_date,CURDATE())/30) AS months_before_expiration' +
          ' FROM stock s' +
          ' JOIN inventory i ON s.inventory_uuid=i.uuid ' +
          ' WHERE s.inventory_uuid=' + sanitize.escape(req.params.id);

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.getStockIntegration = function (req, res, next) {
  'use strict';

  var sql;

  sql =
    'SELECT DISTINCT p.uuid, CONCAT(pr.abbr, p.reference) AS reference, ' +
      'u.first, u.last, p.purchase_date, p.note, m.document_id ' +
    'FROM purchase AS p ' +
    'JOIN stock AS s ON s.purchase_order_uuid = p.uuid ' +
    'JOIN movement AS m ON s.tracking_number = m.tracking_number ' +
    'JOIN project AS pr ON pr.id = p.project_id ' +
    'JOIN user AS u ON u.id = p.emitter_id ' +
    'WHERE p.confirmed = 0 AND p.is_integration = 1;';

  db.exec(sql)
  .then(function (data) {
    res.status(200).json(data);
  })
  .catch(next)
  .done();
};
