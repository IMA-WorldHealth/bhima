/**
* The /transferts HTTP API endpoint
*
* @module finance/transferts
*
* @desc This module is responsible for handling all crud operations relatives
* to financial transferts and define all transferts api functions
*
* @required lib/db
* @required lib/guid
* @required journal/primarycash
*/

'use strict';

var db              = require('../../lib/db'),
    uuid            = require('../../lib/guid'),
    journalTransfer = require('./journal/primarycash').transfer;

/** get the list of all transferts */
exports.list = getList;

/** get the detail of a particular transfert */
exports.detail = getDetail;

/** create a new transfert record in the database */
exports.create = create;

/**
* GET /transferts
* GET /transferts?limit={number}
*
* @desc This function is responsible for getting transferts from the database
*/
function getList(req, res, next) {
  var sql,
      qLimit = req.query.limit;

  /** Getting the transfert module id */
  sql = 'SELECT pcm.id FROM primary_cash_module pcm WHERE pcm.text = "transfert" ';

  db.exec(sql)
  .then(function (row) {
    if (!row.length) { return next(new req.codes.ERR_RESOURCE_NOT_FOUND()); }

    /** Getting transfert records */
    sql =
        'SELECT pc.uuid, pc.project_id, pc.type, pc.date, pc.currency_id, pc.account_id, pc.cost, pc.description, ' +
        'pc.cash_box_id, pc.origin_id, pc.user_id, pci.document_uuid ' +
        'FROM primary_cash pc ' +
        'JOIN primary_cash_item pci ON pci.primary_cash_uuid = pc.uuid ';

    qLimit  = Number(qLimit);

    sql += 'WHERE pc.origin_id = ? ORDER BY pc.date DESC ';
    sql += (qLimit) ? 'LIMIT ' + Math.floor(qLimit) : '';

    return db.exec(sql, [row[0].id]);
  })
  .then(function (rows) {
    if (!rows.length) { return next(new req.codes.ERR_NOT_FOUND()); }
    res.status(200).json(rows);
  })
  .catch(next)
  .done();

}

/**
* GET /transferts/:id
*
* @desc This function is responsible for getting a particular transfert record from the database
*/
function getDetail(req, res, next) {
  var sql,
      qUuid  = req.params.id;

  /** Getting the transfert module id */
  sql = 'SELECT pcm.id FROM primary_cash_module pcm WHERE pcm.text = "transfert" ';

  db.exec(sql)
  .then(function (row) {
    if (!row.length) { return next(new req.codes.ERR_RESOURCE_NOT_FOUND()); }

    /** Getting transfert records */
    sql =
        'SELECT pc.uuid, pc.project_id, pc.type, pc.date, pc.currency_id, pc.account_id, pc.cost, pc.description, ' +
        'pc.cash_box_id, pc.origin_id, pc.user_id, pci.document_uuid ' +
        'FROM primary_cash pc ' +
        'JOIN primary_cash_item pci ON pci.primary_cash_uuid = pc.uuid ';

    sql += 'WHERE pc.origin_id = ? AND pc.uuid = ? ORDER BY pc.date DESC ';

    return db.exec(sql, [row[0].id, qUuid]);
  })
  .then(function (rows) {
    if (!rows.length) { return next(new req.codes.ERR_NOT_FOUND()); }
    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
}


/**
* POST /transferts
*
* @desc This function is responsible for creating a new transfert record in the database
* and writing to the posting journal
*/
function create(req, res, next) {
  var qData = req.body;

  var sqlPrimaryCash = 'INSERT INTO primary_cash ' +
      '(uuid, project_id, type, date, currency_id, account_id, cost, description, cash_box_id, origin_id, user_id) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  var paramPrimaryCash = [
      qData.uuid, qData.project_id, qData.type, new Date(qData.date), qData.currency_id,
      qData.account_id, qData.cost, qData.description, qData.cash_box_id, qData.origin_id, qData.user_id
  ];

  var sqlPrimaryCashItem = 'INSERT INTO primary_cash_item ' +
      '(uuid, primary_cash_uuid, debit, document_uuid, credit) VALUES (?, ?, ?, ?, ?)';
  var paramPrimaryCashItem = [uuid(), qData.uuid, qData.cost, qData.uuid, 0];

  db.exec(sqlPrimaryCash, paramPrimaryCash)
  .then(function () {
    return db.exec(sqlPrimaryCashItem, paramPrimaryCashItem);
  })
  .then(function () {
    journalTransfer(qData.uuid, qData.user_id, function (err, result) {
      if (err) { return next(err); }
      res.status(201).json({ id : qData.uuid });
    });
  })
  .catch(next)
  .done();
}
