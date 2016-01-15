var db = require('../../lib/db');

function list (req, res, next){
  'use strict';

  var sql = 
    'SELECT c.id, c.text FROM cost_center AS c';

  if(req.query.list === 'full'){
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
  var createCostCenterQuery = 'INSERT INTO cost_center SET ?';
  
  db.exec(createCostCenterQuery, [record])
    .then(function (result){
      res.status(201).json({ id: result.insertId });
    })
    .catch(next)
    .done();
}

function update (req, res, next){
  var queryData = req.body;
  var costCenterId = req.params.id;
  var updateCostCenterQuery = 'UPDATE cost_center SET ? WHERE id = ?';

  db.exec(updateCostCenterQuery, [queryData, costCenterId])
  .then(function (result){
    return handleFetchCostCenter(costCenterId);
  })
  .then(function (costCenters){
    var updatedCostCenters = costCenters[0];
    res.status(200).json(updatedCostCenters);
  })
  .catch(next)
  .done();
}

function remove (req, res, next) {
  var costCenterId = req.params.id;
  var removeCostCenterQuery = 'DELETE FROM cost_center WHERE id=?';

  db.exec(removeCostCenterQuery, [costCenterId])
  .then(function (result){
    res.status(200).send();    
  })
  .catch(next)
  .done();
}

function getCostCenter (req, res, next){
  'use strict';

  handleFetchCostCenter(req.params.id)
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

function handleFetchCostCenter (id){
  'use strict';
  var sql = 
    'SELECT cc.id, cc.text, cc.note, cc.is_principal, cc.project_id FROM cost_center AS cc WHERE cc.id = ?';

  return db.exec(sql, id);
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.getCostCenter = getCostCenter;
