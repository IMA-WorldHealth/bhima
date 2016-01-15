var db = require('../../lib/db');

function list (req, res, next){
  'use strict';

  var sql = 
    'SELECT p.id, p.text FROM profit_center AS p';

  if(req.query.list === 'full'){
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
  var createProfitCenterQuery = 'INSERT INTO profit_center SET ?';
  
  db.exec(createProfitCenterQuery, [record])
    .then(function (result){
      res.status(201).json({ id: result.insertId });
    })
    .catch(next)
    .done();
}

function update (req, res, next){
  var queryData = req.body;
  var profitCenterId = req.params.id;
  var updateProfitCenterQuery = 'UPDATE profit_center SET ? WHERE id = ?';

  db.exec(updateProfitCenterQuery, [queryData, profitCenterId])
  .then(function (result){
    return handleFetchProfitCenter(profitCenterId);
  })
  .then(function (profitCenters){
    var updatedProfitCenters = profitCenters[0];
    res.status(200).json(updatedProfitCenters);
  })
  .catch(next)
  .done();
}

function remove (req, res, next) {
  var profitCenterId = req.params.id;
  var removeProfitCenterQuery = 'DELETE FROM profit_center WHERE id=?';

  db.exec(removeProfitCenterQuery, [profitCenterId])
  .then(function (result){
    res.status(200).send();    
  })
  .catch(next)
  .done();
}

function getProfitCenter (req, res, next){
  'use strict';

  handleFetchProfitCenter(req.params.id)
    .then(function (rows) {
      if(rows.length === 0){
        res.status(404).send();
      }else{
        res.status(200).json(rows[0]);
      }
    })
    .catch(next)
    .done();
}

function handleFetchProfitCenter (id){
  'use strict';
  var sql = 
    'SELECT p.id, p.text, p.note, p.project_id FROM profit_center AS p WHERE p.id = ?';

  return db.exec(sql, id);
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.getProfitCenter = getProfitCenter;
