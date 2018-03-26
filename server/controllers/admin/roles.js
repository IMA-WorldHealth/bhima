const db = require('../../lib/db');
const q = require('q');
const FilterParser = require('../../lib/filter');

module.exports.list = list;
module.exports.detail = detail;
module.exports.create = create;
module.exports.update = update;
module.exports.remove = remove;
module.exports.affectPages = affectPages;
module.exports.affectToUser = affectToUser;
module.exports.listForUser = listForUser;

function list(req, res, next) {

  const filters = new FilterParser(req.query, {
    tableAlias : 'r',
  });

  let sql = `
    SELECT BUID(r.uuid) as uuid, r.label, r.project_id 
    FROM role  r
  `;

  filters.equals('project_id');
  sql = filters.applyQuery(sql);

  db.exec(sql, filters.parameters())
    .then((rows) => {
      res.json(rows);
    }).catch(next)
    .done();
}


function detail(req, res, next) {
  const sql = `
   SELECT BUID(uuid) as uuid, label, project_id 
   FROM role
   WHERE  uuid = ?
  `;
  const binaryUuid = db.bid(req.params.uuid);
  db.one(sql, binaryUuid)
    .then((rows) => {
      res.json(rows);
    })
    .catch(next)
    .done();
}

// create a new role
function create(req, res, next) {
  const sql = `
    INSERT INTO  role(uuid, label, project_id)
    VALUES(?, ?,?)
  `;
  db.exec(sql, [db.uuid(), req.body.label, req.body.project_id])
    .then((rows) => {
      res.status(201).json(rows);
    })
    .catch(next)
    .done();
}

function update(req, res, next) {
  const role = req.body;
  delete role.uuid;
  const sql = ` UPDATE role SET ? WHERE uuid = ?`;

  db.exec(sql, [role, db.bid(req.params.uuid)])
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}


function remove(req, res, next) {
  const binaryUuid = db.bid(req.params.uuid);

  const sql = `DELETE FROM role WHERE uuid = ?`;
  db.exec(sql, binaryUuid)
    .then((rows) => {
      res.json(rows);
    })
    .catch(next)
    .done();
}

// affect permission to a specific role

function affectPages(req, res, next) {
  const data = req.body;

  const unitIds = [].concat(data.unit_ids);
  const roleUuid = db.bid(data.role_uuid);

  const deleteFromRole = `DELETE FROM role_unit WHERE role_uuid = ? `;
  const affectPage = `
    INSERT INTO  role_unit(uuid, unit_id, role_uuid)
    VALUES( ?, ?, ?)`;

  db.exec(deleteFromRole, roleUuid)
    .then(() => {
      const promises = unitIds.map(id => { return db.exec(affectPage, [db.uuid(), id, roleUuid]); });
      return q.all(promises);
    })
    .then(() => {
      res.sendStatus(201);
    })
    .catch(next)
    .done();
}


// retireves affected and not affected role by a user id
function listForUser(req, res, next) {
  const userId = req.params.user_id;
  const projectId = req.params.project_id;

  const sql = `
    SELECT DISTINCT q.uuid, q.label, q.project_id , q.affected
    FROM (

    SELECT DISTINCT BUID(r.uuid) as uuid, r.label, r.project_id ,1 as affected
    FROM role r
    JOIN user_role as ur ON ur.role_uuid = r.uuid
    WHERE ur.user_id = ?

    UNION 
    
    SELECT DISTINCT BUID(r.uuid) as uuid, r.label, r.project_id , 0 as affected
    FROM role r
    WHERE r.uuid NOT IN ( 
      select ro.uuid 
      FROM role ro
      JOIN user_role as ur ON ur.role_uuid = ro.uuid
      WHERE ur.user_id = ?
    )
    ) as q
    WHERE q.project_id =?
    ORDER BY q.label
  `;

  db.exec(sql, [userId, userId, projectId])
    .then((roles) => {
      res.json(roles);
    })
    .catch(next)
    .done();
}

// affect roles to a user
// roles ares permissions
function affectToUser(req, res, next) {
  const data = req.body;
  const rolesUuids = [].concat(data.role_uuids);

  const userId = data.user_id;


  const deleleUserRoles = `DELETE FROM user_role WHERE user_id=? `;
  const addRole = `INSERT INTO user_role SET ?`;

  db.exec(deleleUserRoles, userId)
    .then(() => {

      const promisses = rolesUuids.map(roleUuid => {
        return db.exec(addRole, { uuid : db.uuid(), role_uuid : db.bid(roleUuid), user_id : userId });
      });

      return q.all(promisses);
    }).then(() => {
      res.sendStatus(201);
    }).catch(next)
    .done();
}
