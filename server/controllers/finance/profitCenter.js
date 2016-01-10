var db = require('../../lib/db');

function list (req, res, next){
  'use strict';  

  var sql = 
    'SELECT p.id, p.text FROM profit_center AS p';

  if(req.params.list_type == 'detailed'){
    console.log('detailed detailed');
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

exports.list = list;
