/**
 * @overview Users
 *
 * @description
 * The /users API endpoint.  This file is responsible for implementing CRUD
 * operations on the `user` table.
 *
 * @requires lodash
 * @requires db
 * @requires NotFound
 * @requires BadRequest
 */


const _ = require('lodash');
const db = require('../../../lib/db');
const NotFound = require('../../../lib/errors/NotFound');
const BadRequest = require('../../../lib/errors/BadRequest');
const Topic = require('../../../lib/topic');

// expose submodules
exports.permissions = require('./permissions');
exports.projects = require('./projects');

// expose API routes
exports.list = list;
exports.detail = detail;
exports.create = create;
exports.update = update;
exports.delete = remove;
exports.password = password;

exports.lookup = lookupUser;

/**
 * @function lookupUser
 *
 * @description
 * This function looks up a user by their id in the database.  It returns the
 * full details of the user, including a list of their project and permission
 * ids.
 *
 * @param {Number} id - the id of a user in the database
 * @returns {Promise} A promise object with
 */
function lookupUser(id) {
  let data;

  let sql = `
    SELECT user.id, user.username, user.email, user.display_name,
      user.active, user.last_login AS lastLogin, user.deactivated 
    FROM user WHERE user.id = ?;
  `;

  return db.one(sql, [id])
    .then(function (rows) {
      if (!rows.length) {
        throw new NotFound(`Could not find an user with id ${id}`);
      }

      // bind user data to ship back
      data = rows[0];

      // query project permissions
      sql = `
        SELECT pp.project_id FROM project_permission AS pp
        WHERE user_id = ?;
      `;

      return db.exec(sql, [id]);
    })
    .then(rows => {
      return rows.map(row => row.project_id);
    })
    .then(projects => {
      data.projects = projects;
      return data;
    });
}


/**
 * @function list
 *
 * @description
 * If the client queries to /users endpoint, the API will respond with an array
 * of zero or more JSON objects, with id, and username keys.
 *
 * GET /users
 */
function list(req, res, next) {
  const sql =
    `SELECT user.id, display_name,
      user.username, user.deactivated FROM user;`;

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}


/**
 * @function detail
 *
 * @description
 * This endpoint will return a single JSON object containing the full user row
 * for the user with matching ID.  If no matching user exists, it will return a
 * 404 error.
 *
 * For consistency with the CREATE method, this route also returns a user's project
 * permissions.
 *
 * GET /users/:id
 */
function detail(req, res, next) {
  lookupUser(req.params.id)
  .then(function (data) {
    res.status(200).json(data);
  })
  .catch(next)
  .done();
}


/**
 * @method create
 *
 * @description
 * POST /users
 *
 * This endpoint creates a new user from a JSON object.  Required columns are
 * enforced in the database.  Unlike before, the user is created with project
 * permissions.  A user without project access does not make any sense.
 *
 * If the checks succeed, the user password is hashed and stored in the database.
 * A single JSON is returned to the client with the user id.
 *
 */
function create(req, res, next) {
  const data = req.body;
  let userId;

  let sql = `
    INSERT INTO user (username, password, email, display_name) VALUES
    (?, PASSWORD(?), ?, ?);
  `;

  db.exec(sql, [data.username, data.password, data.email, data.display_name])
  .then(function (row) {
    // retain the insert id
    userId = row.insertId;

    sql = 'INSERT INTO project_permission (user_id, project_id) VALUES ?;';

    const projects = data.projects.map(projectId => [userId, projectId]);

    return db.exec(sql, [projects]);
  })
  .then(function () {
    Topic.publish(Topic.channels.ADMIN, {
      event : Topic.events.CREATE,
      entity : Topic.entities.USER,
      user_id : req.session.user.id,
      id : userId,
    });

    // send the ID back to the client
    res.status(201).json({ id : userId });
  })
  .catch(next)
  .done();
}


/**
 * @method update
 *
 * @description
 * PUT /users/:id
 *
 * This endpoint updates a user's information with ID :id.  If the user is not
 * found, the server sends back a 404 error.
 *
 * This method is reserved for changed all other user properties, but NOT the
 * user's password.  To change the user password, use a PUT to users/:id/password
 * with two password fields, password and passwordVerify.
 */
function update(req, res, next) {
  const data = req.body;
  const projects = req.body.projects || [];

  // if the password is sent, return an error
  if (data.password) {
    next(new BadRequest(`You cannot change the password field with this API.`,
        `ERRORS.PROTECTED_FIELD`));
    return;
  }

  // clean default properties before the record is updated
  delete data.projects;
  delete data.id;

  const transaction = db.transaction();

  // if there are projects, add those queries to the transaction first
  if (projects.length) {
    // turn the project id list into user id and project id pairs
    const projectIds = projects.map(projectId => [req.params.id, projectId]);

    transaction
      .addQuery(
        'DELETE FROM project_permission WHERE user_id = ?;',
        [req.params.id]
      )

      .addQuery(
        'INSERT INTO project_permission (user_id, project_id) VALUES ?;',
        [projectIds]
      );
  }

  // begin updating the user if data was sent back (the user might has
  // simply sent permissions changes).
  if (!_.isEmpty(data)) {
    transaction
      .addQuery(
        'UPDATE user SET ? WHERE id = ?;', [data, req.params.id]
      );
  }

  transaction.execute()
  .then(() => lookupUser(req.params.id))
  .then(function (result) {
    Topic.publish(Topic.channels.ADMIN, {
      event : Topic.events.UPDATE,
      entity : Topic.entities.USER,
      user_id : req.session.user.id,
      id : req.params.id,
    });

    res.status(200).json(result);
  })
  .catch(next)
  .done();
}

/**
 * @function password
 *
 * @description
 * PUT /users/:id/password
 *
 * This endpoint updates a user's password with ID :id.  If the user is not
 * found, the server sends back a 404 error.
 */
function password(req, res, next) {
  // TODO -- strict check to see if the user is either signed in or has
  // sudo permissions.
  const sql = `UPDATE user SET password = PASSWORD(?) WHERE id = ?;`;

  db.exec(sql, [req.body.password, req.params.id])
  .then(() => lookupUser(req.params.id))
  .then(function (data) {
    res.status(200).json(data);
  })
  .catch(next)
  .done();
}


/**
 * @function remove
 *
 * @description
 * DELETE /users/:id
 *
 * If the user exists delete it.
 */
function remove(req, res, next) {
  const sql = `DELETE FROM user WHERE id = ?;`;

  db.exec(sql, [req.params.id])
  .then(function (row) {
    if (row.affectedRows === 0) {
      throw new NotFound(`Could not find a user with id ${req.params.id}`);
    }

    Topic.publish(Topic.channels.ADMIN, {
      event : Topic.events.DELETE,
      entity : Topic.entities.USER,
      user_id : req.session.user.id,
      id : req.params.id,
    });

    res.sendStatus(204);
  })
  .catch(next)
  .done();
}
