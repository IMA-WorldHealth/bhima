/**
 * The /projects HTTP API endpoint.
 *
 * This controller is responsible for implementing full CRUD on the
 * project table via the /projects endpoint.
 *
 * NOTE:
 *  this endpoint does not filter for enterprise ID.  We should probably
 *   move to doing this in the future.
 * */

const db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');

/**
 * GET /projects?complete={0|1}
 *
 * Returns an array of {id, name} for each project in the database.
 */
exports.list = function list(req, res, next) {
  let sql;

  // send a larger response if complete is 1
  if (req.query.complete === '1') {
    sql = `SELECT project.id, project.enterprise_id, project.abbr,
      project.zs_id, project.name, project.locked
    FROM project;`;
  } else {
    sql =
      'SELECT project.id, project.name FROM project;';
  }

  if (req.query.locked === '0') {
    sql = `SELECT project.id, project.enterprise_id, project.abbr,
      project.zs_id, project.name, project.locked
    FROM project WHERE project.locked = 0;`;
  }

  if (req.query.locked === '1') {
    sql = `SELECT project.id, project.enterprise_id, project.abbr,
      project.zs_id, project.name, project.locked
    FROM project WHERE project.locked = 1;`;
  }

  if (req.query.incomplete_locked === '0') {
    sql =
      'SELECT project.id, project.name FROM project WHERE project.locked = 0;';
  }

  if (req.query.incomplete_locked === '1') {
    sql =
      'SELECT project.id, project.name FROM project WHERE project.locked = 1;';
  }

  db.exec(sql)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
};


/**
 * GET /projects/:id
 *
 * Returns the details of a single project
 */
exports.detail = function detail(req, res, next) {
  const id = req.params.id;

  const sql = `
    SELECT project.id, project.enterprise_id, project.abbr,
      project.zs_id, project.name, project.locked
    FROM project
    WHERE project.id = ?;
  `;

  db.one(sql, [id], id, 'project')
    .then(project => res.status(200).json(project))
    .catch(next)
    .done();
};

/**
 * POST /projects
 *
 * Creates a new project.
 */
exports.create = function create(req, res, next) {
  const data = req.body;
  const sql =
    `INSERT INTO project (name, abbr, enterprise_id, zs_id, locked) VALUES (?, ?, ?, ?, ?);`;

  db.exec(sql, [data.name, data.abbr, data.enterprise_id, data.zs_id, data.locked])
    .then((row) => {
      res.status(201).send({ id : row.insertId });
    })
    .catch(next)
    .done();
};

/**
 * PUT /projects/:id
 *
 * Updates a new project.
 */
exports.update = function update(req, res, next) {
  let sql;

  sql =
    'UPDATE project SET ? WHERE id = ?;';

  db.exec(sql, [req.body, req.params.id])
    .then(() => {
      sql =
      `SELECT project.id, project.enterprise_id, project.abbr,
        project.zs_id, project.name, project.locked
      FROM project
      WHERE project.id = ?;`;

      return db.exec(sql, [req.params.id]);
    })
    .then((rows) => {
      res.status(200).json(rows[0]);
    })
    .catch(next)
    .done();
};


/**
 * DELETE /projects/:id
 *
 * Deletes a project.
 */
exports.delete = function del(req, res, next) {
  const sql = `DELETE FROM project WHERE id = ?;`;

  db.exec(sql, [req.params.id])
    .then((row) => {
    // if nothing happened, let the client know via a 404 error
      if (row.affectedRows === 0) {
        throw new NotFound(`No project found by id ${req.params.id}.`);
      }

      res.sendStatus(204);
    })
    .catch(next)
    .done();
};
