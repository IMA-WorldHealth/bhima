/**
 * @overview Users/Permissions
 *
 * @description
 * Provides helper functionality to the /users routes.  This file groups all
 * depots-related functionality in the same place.
 *
 * @requires lib/db
 */


const db = require('../../../lib/db');

exports.list = list;
exports.create = create;

/**
 * GET /users/:id/depots
 *
 * Lists all the user depots for user with :id
 */
function list(req, res, next) {
  const sql = `
    SELECT BUID(depot_permission.depot_uuid) AS depot_uuid FROM depot_permission
    WHERE depot_permission.user_id = ?;
  `;

  db.exec(sql, [req.params.id])
    .then((rows) => {
      rows = rows.map(row => row.depot_uuid);

      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}


/**
 * POST /users/:id/depots
 *
 * Creates and updates a user's depots.  This works by completely deleting
 * the user's depots and then replacing them with the new depots set.
 */
function create(req, res, next) {
  const transaction = db.transaction();

  transaction
    .addQuery('DELETE FROM depot_permission WHERE user_id = ?;', [req.params.id]);

  // if an array of permission has been sent, add them to an INSERT query
  if (req.body.depots.length) {
    const data = req.body.depots.map((uuid) => {
      return [db.bid(uuid), req.params.id];
    });

    transaction
      .addQuery('INSERT INTO depot_permission (depot_uuid, user_id) VALUES ?', [data]);
  }

  transaction.execute()
    .then(() => {
      res.sendStatus(201);
    })
    .catch(next)
    .done();
}
