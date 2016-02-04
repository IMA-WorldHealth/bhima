var db = require('../../lib/db');

function list (req, res, next) {
  'use strict';

  var sql =
    'SELECT s.id, s.name, s.cost_center_id, s.profit_center_id FROM service AS s';

  if (req.query.full === '1') {
    sql =
      'SELECT s.id, s.name, s.enterprise_id, e.name, e.abbr, cc.id AS cc_id, ' + 
      'cc.text AS cost_center_name, pc.id AS pc_id, pc.text AS profit_center_name ' +
      'FROM service AS s JOIN enterprise AS e ON s.enterprise_id = e.id ' +
      'LEFT JOIN cost_center AS cc ON s.cost_center_id = cc.id LEFT JOIN ' +
      'profit_center AS pc ON s.profit_center_id = pc.id';
  }

  sql += ' ORDER BY s.name;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

function create (req, res, next) {
  'use strict';

  var record = req.body;
  var createServiceQuery = 'INSERT INTO service SET ?';

  delete record.id;

  db.exec(createServiceQuery, [record])
    .then(function (result) {
      res.status(201).json({ id: result.insertId });
    })
    .catch(next)
    .done();
}

function update (req, res, next) {
  'use strict';

  var queryData = req.body;
  var serviceId = req.params.id;
  var updateServiceQuery = 'UPDATE service SET ? WHERE id = ?';


  delete queryData.id;

  if(!isValidData(queryData)) {
    return next(new req.codes.ERR_BAD_VALUE());
  }

  lookupService(serviceId, req.codes)
    .then(function () {
      return db.exec(updateServiceQuery, [queryData, serviceId]);
    })
    .then(function (result) {
      return lookupService(serviceId, req.codes);
    })
    .then(function (service) {
      res.status(200).json(service);
    })
    .catch(next)
    .done();
}

function remove (req, res, next) {
  var serviceId = req.params.id;
  var removeServiceQuery = 'DELETE FROM service WHERE id=?';

  lookupService(serviceId, req.codes)
    .then(function () {
      return db.exec(removeServiceQuery, [serviceId]);
    })
    .then(function () {
      res.status(204).send();
    })
    .catch(next)
    .done();
}

function detail(req, res, next) {
  'use strict';

  lookupService(req.params.id, req.codes)
    .then(function (row) {
      res.status(200).json(row);
    })
    .catch(next)
    .done();
}

function lookupService(id, codes) {
  'use strict';

  var sql =
    'SELECT s.id, s.name, s.enterprise_id, s.cost_center_id, s.profit_center_id FROM service AS s WHERE s.id=?';

  return db.exec(sql, id)
    .then(function (rows) {
      if (rows.length === 0) {
        throw new codes.ERR_NOT_FOUND();
      }
      return rows[0];
    });
}

function isValidData (obj){  

if(obj.enterprise_id){
  if(isNaN(Number(obj.enterprise_id))) {
    return false;
  }
}

  if(obj.cost_center_id) {
    if(isNaN(Number(obj.cost_center_id))){
      return false;
    }
  }

  if(obj.profit_center_id) {
    if(isNaN(Number(obj.profit_center_id) )){
      return false;
    }
  }

  return true;
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;
