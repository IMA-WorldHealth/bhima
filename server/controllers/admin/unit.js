const db = require('../../lib/db');

exports.list = list;

/**
 * @function list
 *
 * @description
 * Returns the list of units associated with a role
 *
 * ROUTE:
 * GET  /roles/${uuid}/units
 */
function list(req, res, next) {
  const roleUuid = db.bid(req.params.uuid);

  const sql = `
    SELECT unit.id, unit.key, unit.parent
    FROM role
      JOIN role_unit ON role.uuid = role_unit.role_uuid
      JOIN unit ON role_unit.unit_id = unit.id
    WHERE role.uuid = ?;
  `;

  db.exec(sql, [roleUuid])
    .then(units => {
      res.status(200).json(units);
    })
    .catch(next)
    .done();
}
