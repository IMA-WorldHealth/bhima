/**
 * Transaction Type Controller
 * This controller handle transaction type crud operations
 */


const db = require('../../lib/db');
const BadRequest = require('../../lib/errors/BadRequest');

// expose to the API
exports.list = list;
exports.detail = detail;
exports.create = create;
exports.update = update;
exports.remove = remove;

/** list transfer type */
function list(req, res, next) {
  getTransactionType()
  .then(rows => res.status(200).json(rows))
  .catch(next)
  .done();
}

/** detail transfer type */
function detail(req, res, next) {
  getTransactionType(req.params.id)
  .then(rows => res.status(200).json(rows[0]))
  .catch(next)
  .done();
}

/** create transfer type */
function create(req, res, next) {
  const sql = `INSERT INTO transaction_type SET ?`;
  db.exec(sql, [req.body])
  .then(rows => {
    return res.status(201).json({ id : rows.insertId });
  })
  .catch(next)
  .done();
}

/** update transfer type */
function update(req, res, next) {
  const sql = `UPDATE transaction_type SET ? WHERE id = ? AND fixed <> 1`;

  db.exec(sql, [req.body, req.params.id])
  .then((rows) => {
    if (!rows.affectedRows) {
      throw new BadRequest('ERRORS.NOT_ALLOWED');
    }
    return getTransactionType(req.params.id);
  })
  .then(rows => res.status(200).json(rows))
  .catch(next)
  .done();
}

/** delete transfer type */
function remove(req, res, next) {
  const sql = `DELETE FROM transaction_type WHERE id = ? AND fixed <> 1`;

  db.exec(sql, [req.params.id])
  .then(() => res.status(204).json())
  .catch(next)
  .done();
}

/** get transaction type */
function getTransactionType(id) {
  let sql = `SELECT id, text, type, prefix, fixed FROM transaction_type`;
  sql += id ? ' WHERE id = ?;' : ';';
  return db.exec(sql, [id]);
}
