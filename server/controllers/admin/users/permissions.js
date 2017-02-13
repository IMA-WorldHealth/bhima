/**
 * @overview Users/Permissions
 *
 * @description
 * Provides helper functionality to the /users routes.  This file groups all
 * permissions-related functionality in the same place.
 *
 * @requires lib/db
 */


const db = require('../../../lib/db');

exports.list = list;
exports.create = create;

/**
 * GET /users/:id/permissions
 *
 * Lists all the user permissions for user with :id
 */
function list(req, res, next) {
  let sql = `
    SELECT permission.id, permission.unit_id FROM permission
    WHERE permission.user_id = ?;
  `;

  db.exec(sql, [req.params.id])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}


/**
 * POST /users/:id/permissions
 *
 * Creates and updates a user's permissions.  This works by completely deleting
 * the user's permissions and then replacing them with the new permissions set.
 */
function create(req, res, next) {

  let data = req.body.permissions.map(function (id) {
    return [id, req.params.id];
  });

  let transaction = db.transaction();

  transaction
    .addQuery('DELETE FROM permission WHERE user_id = ?;', [req.params.id]);

  // if an array of permission has been sent, add them to an INSERT query
  if (req.body.permissions.length) {
    transaction
      .addQuery('INSERT INTO permission (unit_id, user_id) VALUES ?', [data]);
  }

  transaction.execute()
    .then(function () {
      res.sendStatus(201);
    })
    .catch(next)
    .done();
}
