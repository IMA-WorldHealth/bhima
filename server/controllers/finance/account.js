var db = require('../../lib/db');

function create (req, res, next){
  var record = req.body;
  var create_account_query = 'INSERT INTO account SET ?';
  var transaction = db.transaction();

  transaction
  .addQuery(create_account_query, [record]);

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
}

function list (req, res, next){
  'use strict';

  var sql = 
    'SELECT a.id, a.account_number, a.account_txt FROM account AS a';

  if(req.params.list_type == 'detailed'){
    sql = 
      'SELECT a.id, a.enterprise_id, a.locked, a.cc_id, a.pc_id, a.created, a.classe, a.is_asset, ' + 
      'a.reference_id, a.is_brut_link, a.is_used_budget, a.is_charge, a.account_number, ' +
      'a.account_txt, a.parent, a.account_type_id, a.is_title, at.type FROM account AS a JOIN account_type AS at ON a.account_type_id = at.id';
  }

  sql += ' ORDER BY a.account_number;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}



exports.list = list;
exports.create = create;
exports.update = update;
