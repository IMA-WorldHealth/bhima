/**
 * @overview Users/Permissions
 *
 * @description
 * Provides helper functionality to the /users routes.  This file groups all
 * cashboxes-related functionality in the same place.
 *
 * @requires lib/db
 */


const db = require('../../../lib/db');

exports.list = list;
exports.create = create;

/**
 * GET /users/:id/cashboxes
 *
 * Lists all the user cashboxes for user with :id
 */
function list(req, res, next) {
  const sql = `
    SELECT cashbox_id FROM cashbox_permission
    WHERE cashbox_permission.user_id = ?;
  `;

  db.exec(sql, [req.params.id])
    .then((rows) => {
      rows = rows.map(row => row.cashbox_id);

      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}


/**
 * POST /users/:id/cashboxes
 *
 * Creates and updates a user's cashboxes.  This works by completely deleting
 * the user's cashboxes and then replacing them with the new cashboxes set.
 */
function create(req, res, next) {
  const transaction = db.transaction();

  transaction
    .addQuery('DELETE FROM cashbox_permission WHERE user_id = ?;', [req.params.id]);

  // if an array of permission has been sent, add them to an INSERT query
  if (req.body.cashboxes.length) {
    const data = req.body.cashboxes.map((id) => {
      return [id, req.params.id];
    });

    transaction
      .addQuery('INSERT INTO cashbox_permission (cashbox_id, user_id) VALUES ?', [data]);
  }

  transaction.execute()
    .then(() => {
      res.sendStatus(201);
    })
    .catch(next)
    .done();
}
