var db = require('../../lib/db');

function list (req, res, next){
  'use strict';

  var sql = 
    'SELECT c.id, c.text FROM cost_center AS c';

  if(req.params.list_type == 'detailed'){
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

exports.list = list;
