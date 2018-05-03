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
module.exports.rolesAction = rolesAction;
module.exports.hasAction = hasAction;
module.exports.assignActionToRole = assignActionToRole;

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


// retrieves affected and not affected role by a user id
function listForUser(req, res, next) {
  const userId = req.params.user_id;
  const projectId = req.params.project_id;
  const sql = `
    SELECT BUID(r.uuid) as uuid, r.label, r.project_id , IFNULL(s.affected, 0) as affected
    FROM role r
    LEFT JOIN(
      select  ro.uuid, 1 as affected 
      FROM user_role ur
      JOIN role ro ON ur.role_uuid = ro.uuid
      WHERE ur.user_id = ?
    )s ON s.uuid = r.uuid
    ORDER BY r.label
  `;

  db.exec(sql, [userId, userId, projectId])
    .then((roles) => {
      res.json(roles);
    })
    .catch(next)
    .done();
}


function rolesAction(req, res, next) {

  const roleUuid = db.bid(req.params.roleUuid);
  const sql = `
    SELECT a.id, a.description, IFNULL(s.affected, 0) as affected
    FROM actions a
    LEFT JOIN(
      select  actions_id , 1 as affected 
      FROM role_actions ra
      JOIN role ro ON ra.role_uuid = ro.uuid
      WHERE ro.uuid = ?
    )s ON s.actions_id = a.id
  `;

  db.exec(sql, [roleUuid])
    .then((actions) => {
      res.json(actions);
    })
    .catch(next)
    .done();
}


// affect roles to a user
// actions ares permissions for a role used most of the time in the view
// some actions are sensitive
function assignActionToRole(req, res, next) {
  const data = req.body;

  const actionIds = [...data.action_ids];

  const roleUuid = db.bid(data.role_uuid);
  const transaction = db.transaction();

  const deleleUserRoles = `DELETE FROM role_actions WHERE role_uuid=? `;
  const addAction = `INSERT INTO role_actions SET ?`;

  db.exec(deleleUserRoles, roleUuid)
    .then(() => {
      actionIds.forEach(actionId => {
        transaction.addQuery(addAction, { uuid : db.uuid(), role_uuid : roleUuid, actions_id : actionId });
      });
      return transaction.execute();
    }).then(() => {
      res.sendStatus(201);
    }).catch(next)
    .done();
}

function hasAction(req, res, next) {
  const actionId = req.params.action_id;
  const userId = req.session.user.id;

  const sql = `
    SELECT count(ra.uuid) as nbr FROM role_actions ra
    JOIN user_role as ur ON ur.role_uuid = ra.role_uuid
    WHERE actions_id =? AND ur.user_id=?`;

  db.one(sql, [actionId, userId]).then(row => {
    res.status(200).json(row.nbr > 0);
  }).catch(next)
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
