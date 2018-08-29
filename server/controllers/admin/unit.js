const q = require('q');
const db = require('../../lib/db');

module.exports.list = list;

/**
 *
 * @function list
 * return the tree
 * each modules and his pages
 */
function list(req, res, next) {
  const roleUuid = db.bid(req.params.roleUuid);

  // permission(pages) in a module
  // the column affect will inform is the user has acces to the permission
  const sql = `
  SELECT  un.*,  IFNULL(s.affected, 0) as affected
  FROM unit 
  as un LEFT JOIN (
    SELECT  u.id, 1 as affected
    FROM unit u
    JOIN role_unit as ru ON ru.unit_id = u.id
    WHERE ru.role_uuid =?
  )s ON s.id = un.id
  `;
  // get modules

  // parent nodes
  const sql1 = `${sql}\n WHERE un.parent=0`;
  // children
  const sql2 = `${sql}\n WHERE un.parent=?`;

  let modules = [];

  db.exec(sql1, [roleUuid]).then((rows) => {
    modules = rows;
    return q.all(rows.map(row => { return db.exec(sql2, [roleUuid, row.id]); }));
  })
    .then((permissions) => {
      permissions.forEach((permission, idx) => {
        modules[idx].pages = permission;
      });

      res.json(modules);
    })
    .catch(next)
    .done();
}
