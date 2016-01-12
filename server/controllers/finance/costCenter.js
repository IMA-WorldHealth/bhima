var db = require('../../lib/db');

function list (req, res, next){
  'use strict';

  var sql = 
    'SELECT c.id, c.text FROM cost_center AS c';

  if(req.query.list == 'full'){
    sql = 
      'SELECT c.id, c.text, c.project_id, c.note, c.is_principal, p.name, p.abbr, p.enterprise_id, p.zs_id ' +
      'FROM cost_center AS c JOIN project AS p ON c.project_id = p.id';
  }

  sql += ' ORDER BY c.text;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

function create (req, res, next) {
  var record = req.body;
  var create_cost_center_query = 'INSERT INTO cost_center SET ?';
  var transaction = db.transaction();

  transaction
  .addQuery(create_cost_center_query, [record]);

  transaction.execute()
  .then(function (results){
    var confirmation = results;
    res.status(201).json(confirmation);
    return;
  })
  .catch(next)
  .done();
}

function update (req, res, next){
  var queryData = req.body;
  var costCenterId = req.params.id;
  var update_cost_center_query = 'UPDATE cost_center SET ? WHERE id = ?';

  db.exec(update_cost_center_query, [queryData, costCenterId])
  .then(function (results){
    var confirmation = results;
    res.status(200).json(confirmation);
    return;
  })
  .catch(next)
  .done();
}

function remove (req, res, next) {
  var costCenterId = req.params.id;
  var remove_cost_center_query = 'DELETE FROM cost_center WHERE id=?';

  db.exec(remove_cost_center_query, [costCenterId])
  .then(function (results){
    var confirmation = results;
    res.status(200).json(confirmation);
    return;
  })
  .catch(next)
  .done();
}

function getCostCenter (req, res, next){
  'use strict';

  var sql = 
    'SELECT cc.id, cc.text, cc.note, cc.is_principal, cc.project_id FROM cost_center AS cc WHERE cc.id = ?';

  db.exec(sql, req.params.id)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.getCostCenter = getCostCenter;
