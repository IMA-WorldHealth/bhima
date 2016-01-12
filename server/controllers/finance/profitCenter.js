var db = require('../../lib/db');

function list (req, res, next){
  'use strict';  

  var sql = 
    'SELECT p.id, p.text FROM profit_center AS p';

  if(req.query.list == 'full'){
    sql = 
      'SELECT p.id, p.text, p.project_id, p.note, pr.name, pr.abbr, pr.enterprise_id, pr.zs_id ' +
      'FROM profit_center AS p JOIN project AS pr ON p.project_id = pr.id';
  }

  sql += ' ORDER BY p.text;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}


function create (req, res, next) {
  var record = req.body;
  var create_profit_center_query = 'INSERT INTO profit_center SET ?';
  var transaction = db.transaction();

  transaction
  .addQuery(create_profit_center_query, [record]);

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
  var profitCenterId = req.params.id;
  var update_profit_center_query = 'UPDATE profit_center SET ? WHERE id = ?';

  db.exec(update_profit_center_query, [queryData, profitCenterId])
  .then(function (results){
    var confirmation = results;
    res.status(200).json(confirmation);
    return;
  })
  .catch(next)
  .done();
}

function remove (req, res, next) {
  var profitCenterId = req.params.id;
  var remove_profit_center_query = 'DELETE FROM profit_center WHERE id=?';

  db.exec(remove_profit_center_query, [profitCenterId])
  .then(function (results){
    var confirmation = results;
    res.status(200).json(confirmation);
    return;
  })
  .catch(next)
  .done();
}

function getProfitCenter (req, res, next){
  'use strict';

  var sql = 
    'SELECT pc.id, pc.text, pc.note, pc.project_id FROM profit_center AS pc WHERE pc.id = ?';

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
exports.getProfitCenter = getProfitCenter;
