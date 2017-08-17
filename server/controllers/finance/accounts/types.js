/**
 * @overview AccountType
 *
 * @description
 * Implements CRUD operations on the account_type entity.
 *
 * This module implements the following routes:
 *  GET    /accounts/types
 *  GET    /accounts/types/:id
 *  POST   /accounts/types
 *  PUT    /accounts/types/:id
 *  DELETE /accounts/types/:id
 *
 * @requires db
 * @requires NotFound
 */

const db = require('../../../lib/db');

/**
 * @method detail
 *
 * @description
 * Retrieves a single account type item from the database
 *
 * GET /accounts/types/:id
 */
function detail(req, res, next) {
  lookupAccountType(req.params.id)
    .then((row) => {
      res.status(200).json(row);
    })
    .catch(next)
    .done();
}

/**
 * @method list
 *
 * @description
 * Lists all recorded account type entities.
 *
 * GET /accounts/types
 */
function list(req, res, next) {
  const sql =
    'SELECT `id`, `type`, `translation_key` FROM account_type;';

  db.exec(sql)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}


/**
 * @method create
 *
 * @description
 * Create a new account type entity.
 *
 * POST /accounts/types
 */
function create(req, res, next) {
  const record = req.body;
  const sql = 'INSERT INTO account_type SET ?';

  delete record.id;

  /**
   * @todo
   * design/ update account types to allow setting a translation_key
   * - the implications of this are system wide
   * */
  record.translation_key = '';

  db.exec(sql, [record])
    .then((result) => {
      res.status(201).json({ id : result.insertId });
    })
    .catch(next)
    .done();
}

/**
 * @method update
 *
 * @description
 * Updates an account type's properties.
 *
 * PUT /accounts/types/:id
 */
function update(req, res, next) {
  const data = req.body;
  const id = req.params.id;
  const sql = 'UPDATE account_type SET ? WHERE id = ?';

  delete data.id;

  lookupAccountType(id)
    .then(() => db.exec(sql, [data, id]))
    .then(() => lookupAccountType(id))
    .then((accountType) => {
      res.status(200).json(accountType);
    })
    .catch(next)
    .done();
}

/**
 * @method remove
 *
 * @description
 * Deletes an account type from the database
 *
 * DELETE /accounts/types/:id
 */
function remove(req, res, next) {
  const id = req.params.id;
  const sql = 'DELETE FROM account_type WHERE id = ?';

  lookupAccountType(id)
    .then(() => {
      return db.exec(sql, [id]);
    })
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next)
    .done();
}

/**
 * @method lookupAccountType
 *
 * @description
 * Retrieves an account type by id.  If none matches, throws a NotFound error.
 *
 * @param {Number} id - the id of the account type
 * @returns {Promise} - a promise resolving to the result of the database.
 */
function lookupAccountType(id) {
  const sql =
    'SELECT at.id, at.type FROM account_type AS at WHERE at.id = ?;';

  return db.one(sql, id);
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;
