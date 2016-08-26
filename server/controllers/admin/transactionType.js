/**
 * Transaction Type Controller
 * This controller handle transaction type crud operations
 */

'use strict';

const db = require('../../lib/db');
const util = require('../../lib/util');
const NotFound = require('../../lib/errors/NotFound');

// expose to the API
exports.list   = list;
exports.detail = detail;
exports.create = create;
exports.update = update;
exports.remove = remove;

/** list transfer type */
function list (req, res, next) {
  getTransactionType()
  .then(rows => res.status(200).json(rows))
  .catch(next)
  .done();
}

/** detail transfer type */
function detail (req, res, next) {
  getTransactionType(req.params.id)
  .then(rows => res.status(200).json(rows[0]))
  .catch(next)
  .done();
}

/** create transfer type */
function create (req, res, next) {
  let sql = `INSERT INTO transaction_type SET ?`;

  db.exec(sql, [req.body])
  .then(rows => res.status(201).json({ id: req.body.id }))
  .catch(next)
  .done();
}

/** update transfer type */
function update (req, res, next) {
  let sql = `UPDATE transaction_type SET ? WHERE id = ?`;

  db.exec(sql, [req.body, req.params.id])
  .then(() => getTransactionType(req.params.id))
  .then(rows => res.status(200).json(rows))
  .catch(next)
  .done();
}

/** delete transfer type */
function remove (req, res, next) {
  let sql = `DELETE FROM transaction_type WHERE id = ?`;

  db.exec(sql, [req.params.id])
  .then(rows => res.status(204).json())
  .catch(next)
  .done();
}

/** get transaction type */
function getTransactionType(id) {
    let sql = `SELECT id, text, description, type, prefix FROM transaction_type`;
    sql += id ? ' WHERE id = ?;' : ';';
    return db.exec(sql, [id]);
}
