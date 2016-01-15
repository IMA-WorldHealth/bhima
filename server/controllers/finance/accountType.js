var db = require('../../lib/db');

function getAccountType (req, res, next){
  'use strict';
  handleFetchAccountType(req.params.id)
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

function create (req, res, next) {
  var record = req.body;
  var createAccountTypeQuery = 'INSERT INTO account_type SET ?';
  
  db.exec(createAccountTypeQuery, [record])
    .then(function (result){
      res.status(201).json({ id: result.insertId});
    })
    .catch(next)
    .done();
}

function update (req, res, next){
  var queryData = req.body;
  var accountTypeId = req.params.id;
  var updateAccountTypeQuery = 'UPDATE account_type SET ? WHERE id = ?';

  db.exec(updateAccountTypeQuery, [queryData, accountTypeId])
   .then(function (result){
    return handleFetchAccountType(accountTypeId);
  })
  .then(function (accountTypes){
    var updatedAccountType = accountTypes[0];
    res.status(200).json(updatedAccountType);
  })
  .catch(next)
  .done();
}

function remove (req, res, next) {
  var accountTypeId = req.params.id;
  var removeAccountTypeQuery = 'DELETE FROM account_type WHERE id=?';

  db.exec(removeAccountTypeQuery, [accountTypeId])
  .then(function (result){
      res.status(200).send();
    })
    .catch(next)
    .done();
}

function handleFetchAccountType(id){
  var sql = 
    'SELECT at.id, at.type FROM account_type AS at WHERE at.id = ?';
  return db.exec(sql, id);
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.getAccountType = getAccountType;

