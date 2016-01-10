var db = require('../../lib/db');

function list (req, res, next){
  'use strict';

  var sql = 
    'SELECT at.id, at.type FROM account_type AS at';  

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

exports.list = list;
