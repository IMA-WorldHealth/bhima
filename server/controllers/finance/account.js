var db = require('../../lib/db');

function create (req, res, next){
  var record = req.body;
  var createAccountQuery = 'INSERT INTO account SET ?';
  
  db.exec(createAccountQuery, [record])
  .then(function (result){
      res.status(201).json({id : result.insertId});
  })
  .catch(next)
  .done();
}

function update (req, res, next){
  var queryData = req.body;
  var accountId = req.params.id;
  var updateAccountQuery = 'UPDATE account SET ? WHERE id = ?';

  db.exec(updateAccountQuery, [queryData, accountId])
  .then(function (result){
    return handleFetchAccount(accountId);
  })
  .then(function (accounts){
    var updatedAccount = accounts[0];
    res.status(200).json(updatedAccount);
  })
  .catch(next)
  .done();
}

function list (req, res, next){
  'use strict';

  var sql = 
    'SELECT a.id, a.account_number, a.account_txt FROM account AS a';

  if(req.query.list === 'full'){
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

function getAccount (req, res, next){
  'use strict';

  handleFetchAccount(req.params.id)
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

function handleFetchAccount (id){
  'use strict';

  var sql = 
    'SELECT a.id, a.enterprise_id, a.locked, a.cc_id, a.pc_id, a.created, a.classe, a.is_asset, ' + 
    'a.reference_id, a.is_brut_link, a.is_used_budget, a.is_charge, a.account_number, ' +
    'a.account_txt, a.parent, a.account_type_id, a.is_title, at.type FROM account AS a JOIN account_type AS at ON a.account_type_id = at.id WHERE a.id = ?';

  return db.exec(sql, id);
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.getAccount = getAccount;
