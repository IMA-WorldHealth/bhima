var db = require('../../lib/db');

function getAccountType (req, res, next){
  'use strict';

  var sql = 
    'SELECT at.id, at.type FROM account_type AS at WHERE at.id = ?';

  db.exec(sql, req.params.id)
  .then(function (rows) {
    res.status(200).json(rows);
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
  var create_account_type_query = 'INSERT INTO account_type SET ?';
  var transaction = db.transaction();

  transaction
  .addQuery(create_account_type_query, [record]);

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
  var accountTypeId = req.params.id;
  var update_account_type_query = 'UPDATE account_type SET ? WHERE id = ?';

  db.exec(update_account_type_query, [queryData, accountTypeId])
  .then(function (results){
    var confirmation = results;
    res.status(200).json(confirmation);
    return;
  })
  .catch(next)
  .done();
}

function remove (req, res, next) {
  var accountTypeId = req.params.id;
  var remove_account_type_query = 'DELETE FROM account_type WHERE id=?';

  db.exec(remove_account_type_query, [accountTypeId])
  .then(function (results){
    var confirmation = results;
    res.status(200).json(confirmation);
    return;
  })
  .catch(next)
  .done();
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.getAccountType = getAccountType;

