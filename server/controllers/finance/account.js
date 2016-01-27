/**
 * Account Controller
 *
 * @module finance/account
 * @author DedrickEnc
 *
 * @desc Implements CRUD operations on the Account entity.
 *
 * This module implements the following routes:
 * GET    /accounts
 * GET    /accounts/:id
 * POST   /accounts
 * PUT    /accounts/:id
 *
 * */

var db = require('../../lib/db');

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

  lookupAccount(accountId, req.codes)
    .then(function () {
      return db.exec(updateAccountQuery, [queryData, accountId]);
    })
    .then(function() {
      return lookupAccount(accountId, req.codes);
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
    'SELECT a.id, a.account_number, a.account_txt, a.locked FROM account AS a';

  if (req.query.full === '1') {

    sql =
      'SELECT a.id, a.enterprise_id, a.locked, a.cc_id, a.pc_id, a.created, a.classe, a.is_asset, ' +
      'a.reference_id, a.is_brut_link, a.is_used_budget, a.is_charge, a.account_number, ' +
      'a.account_txt, a.parent, a.account_type_id, a.is_title, at.type FROM account AS a JOIN account_type AS at ON a.account_type_id = at.id';
  }

  if (req.query.locked === '0') {
    sql+=' WHERE a.locked = 0';
  }

  sql += ' ORDER BY a.account_number;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

function detail(req, res, next) {
  'use strict';

  lookupAccount(req.params.id, req.codes)
   .then(function (account) {
      res.status(200).json(account);
   })
  .catch(next)
  .done();
}

function lookupAccount(id, codes) {
  'use strict';

  var sql =
    'SELECT a.id, a.enterprise_id, a.locked, a.cc_id, a.pc_id, a.created, a.classe, a.is_asset, ' +
    'a.reference_id, a.is_brut_link, a.is_used_budget, a.is_charge, a.account_number, ' +
    'a.account_txt, a.parent, a.account_type_id, a.is_title, at.type FROM account AS a JOIN account_type AS at ON a.account_type_id = at.id WHERE a.id = ?';

  return db.exec(sql, id)
    .then(function(rows) {
      if (rows.length === 0) {
        throw new codes.ERR_NOT_FOUND();
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
