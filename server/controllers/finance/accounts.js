/**
 * Account Controller
 *
 * @desc Implements CRUD operations on the Account entity.
 *
 * This module implements the following routes:
 * GET    /accounts
 * GET    /accounts/:id
 * GET    /accounts/:id/balance/
 * POST   /accounts
 * PUT    /accounts/:id
 *
 * @module finance/account
 */

var db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');

/**
 * Create a new account entity.
 *
 * POST /accounts
 */
function create (req, res, next) {
  'use strict';

  var record = req.body;
  var createAccountQuery = 'INSERT INTO account SET ?';

  delete record.id;

  db.exec(createAccountQuery, [record])
  .then(function (result) {
      res.status(201).json({id : result.insertId});
  })
  .catch(next)
  .done();
}

/**
 * Updates an account.
 *
 * PUT /accounts/:id
 */
function update (req, res, next) {
  'use strict';

  var queryData = req.body;
  var accountId = req.params.id;
  var updateAccountQuery = 'UPDATE account SET ? WHERE id = ?';

  delete queryData.id;

  lookupAccount(accountId)
    .then(function () {
      return db.exec(updateAccountQuery, [queryData, accountId]);
    })
    .then(function() {
      return lookupAccount(accountId);
    })
    .then(function (account) {
      res.status(200).json(account);
    })
    .catch(next)
    .done();
}

function list (req, res, next) {
  'use strict';

  var sql =
    'SELECT a.id, a.number, a.label, a.locked FROM account AS a';

  if (req.query.full === '1') {

    sql =
      'SELECT a.id, a.enterprise_id, a.locked, a.cc_id, a.pc_id, a.created, a.classe, a.is_asset, ' +
      'a.reference_id, a.is_brut_link, a.is_charge, a.number, ' +
      'a.label, a.parent, a.type_id, a.is_title, at.type FROM account AS a JOIN account_type AS at ON a.type_id = at.id';
  }

  if (req.query.locked === '0') {
    sql+=' WHERE a.locked = 0';
  }

  sql += ' ORDER BY a.number;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

function detail(req, res, next) {
  'use strict';

  lookupAccount(req.params.id)
   .then(function (account) {
      res.status(200).json(account);
   })
  .catch(next)
  .done();
}

function getBalance (req, res, next){
  'use strict';

  var accountId = req.params.id, optional = '';
  var params = [accountId];

  if(req.query.journal === '1') {
    optional = ' UNION ALL SELECT pj.account_id, IFNULL(SUM(pj.debit), 0) AS debit, IFNULL(SUM(pj.credit), 0) AS credit, IFNULL((pj.debit - pj.credit), 0) AS balance FROM posting_journal AS pj WHERE pj.account_id = ? GROUP BY pj.account_id';
    params.push(accountId);
  }

  var accountSoldQuery = 'SELECT t.account_id, IFNULL(SUM(t.debit), 0) AS debit, IFNULL(SUM(t.credit), 0) AS credit, IFNULL(t.balance, 0) AS balance FROM' +
    ' (SELECT gl.account_id, IFNULL(SUM(gl.debit), 0) AS debit, IFNULL(SUM(gl.credit), 0) AS credit, IFNULL((gl.debit - gl.credit), 0) AS balance FROM' +
    ' general_ledger AS gl WHERE gl.account_id = ? GROUP BY gl.account_id' + optional + ' ) AS t GROUP BY t.account_id';

  lookupAccount(accountId)
    .then(function (account) {
      return db.exec(accountSoldQuery, params);
    })
    .then(function (rows){

      var response = (rows.length === 0) ?
       {account_id : accountId, debit : 0, credit : 0, balance : 0 } :
       rows[0];

      res.status(200).json(response);
    })
    .catch(next)
    .done();
}

function lookupAccount(id) {
  'use strict';

  var sql =
    'SELECT a.id, a.enterprise_id, a.locked, a.cc_id, a.pc_id, a.created, a.classe, a.is_asset, ' +
    'a.reference_id, a.is_brut_link, a.is_charge, a.number, ' +
    'a.label, a.parent, a.type_id, a.is_title, at.type FROM account AS a JOIN account_type AS at ON a.type_id = at.id WHERE a.id = ?';

  return db.exec(sql, id)
    .then(function(rows) {
      // Record Not Found !
      if (rows.length === 0) {
        throw new NotFound(`Record Not Found with id: ${id}`);
      }

      return rows[0];
    });
}

function isEmptyObject(object) {
  return Object.keys(object).length === 0;
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.detail = detail;
exports.getBalance = getBalance;
