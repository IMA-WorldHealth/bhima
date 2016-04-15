/**
 * AccountType controller
 * 
 * @module finance/accountType
 * @author DedrickEnc
 *
 * @desc Implements CRUD operations on the AccountType entity.
 *
 * This module implements the following routes:
 * GET    /account_types
 * GET    /account_types/:id
 * POST   /account_types
 * PUT    /account_types/:id
 * DELETE /accounts_types/:id
 *
 **/
 
var db = require('../../lib/db');
var NotFound = require('../../lib/errors/NotFound');

function detail(req, res, next){
  'use strict';

  lookupAccountType(req.params.id)
    .then(function (row) {
      res.status(200).json(row);
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


/**
 * Create a new account type entity.
 *
 * POST /account_types
 */
function create (req, res, next) {
  'use strict';

  var record = req.body;
  var createAccountTypeQuery = 'INSERT INTO account_type SET ?';
  
  delete record.id;

  db.exec(createAccountTypeQuery, [record])
    .then(function (result){
      res.status(201).json({ id: result.insertId});
    })
    .catch(next)
    .done();
}

function update (req, res, next){
  'use strict';

  var queryData = req.body;
  var accountTypeId = req.params.id;
  var updateAccountTypeQuery = 'UPDATE account_type SET ? WHERE id = ?';

  delete queryData.id;

  lookupAccountType(accountTypeId)
    .then(function (){
      return db.exec(updateAccountTypeQuery, [queryData, accountTypeId]);
    }) 
   .then(function (){
      return lookupAccountType(accountTypeId);
  })
  .then(function (accountType){
    res.status(200).json(accountType);
  })
  .catch(next)
  .done();
}

function remove (req, res, next) {
  var accountTypeId = req.params.id;
  var removeAccountTypeQuery = 'DELETE FROM account_type WHERE id=?';

  lookupAccountType(accountTypeId)
    .then(function (){
      return db.exec(removeAccountTypeQuery, [accountTypeId]);
    })
    .then(function (){
      res.status(204).send();
    })
    .catch(next)
    .done();
}

function lookupAccountType(id){
  'use strict';
  
  var sql = 
    'SELECT at.id, at.type FROM account_type AS at WHERE at.id = ?';

  return db.exec(sql, id)
    .then(function (rows){
      if (rows.length === 0) {
        throw new NotFound(`Could not find an Account Type with id ${id}`);
      }
      return rows[0];
    });
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;

