/**
 * @overview
 * Authentication Controller
 *
 * This controller is responsible for managing user authentication and
 * authorization to the entire application stack.
 *
 * @todo - user roles should be designed and implemented to restrict a
 * user's ability to selected routes.
 *
 * @requires lib/db
 * @requires Topic
 * @requires lib/errors/Unauthorized
 * @requires lib/errors/Forbidden
 * @requires lib/errors/InternalServerError
 */

const db = require('../lib/db');
const Unauthorized = require('../lib/errors/Unauthorized');
const InternalServerError = require('../lib/errors/InternalServerError');
const Topic = require('../lib/topic');

// POST /auth/login
exports.login = login;

// GET /auth/logout
exports.logout = logout;

// POST /auth/reload
exports.reload = reload;

/**
 * @method login
 *
 * @description
 * Logs a client into the server.  The /login route accepts a POST request with
 * a username, password, and project id.  It checks if the username and password
 * exist in the database, then verifies that the user has permission to access
 * the database all enterprise, project, and user data for easy access.
 */
function login(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;
  const projectId = req.body.project;
  const param = {};

  const sql =
    `
    SELECT 
      user.id, user.username, user.display_name, user.email, user.deactivated, 
      project.enterprise_id , project.id AS project_id
    FROM user 
    JOIN 
    project_permission JOIN project ON user.id = project_permission.user_id 
    AND project.id = project_permission.project_id
    WHERE 
      user.username = ? AND user.password = PASSWORD(?) 
      AND project_permission.project_id = ?;
  `;

  const sqlUser = `
    SELECT user.id FROM user
    WHERE user.username = ? AND user.password = PASSWORD(?)`;

  const sqlPermission =
    `SELECT permission.id FROM permission
    JOIN user ON user.id = permission.user_id
    WHERE user.username = ? AND user.password = PASSWORD(?)`;


  db.exec(sql, [username, password, projectId])
    .then(function (rows) {
      param.connect = rows;

      return db.exec(sqlUser, [username, password]);
    })
    .then(function (rows) {
      param.user = rows;
      return db.exec(sqlPermission, [username, password]);
    })
    .then(function (rows) {
      param.permission = rows;
      const connect = param.connect.length;
      const permission = param.permission.length;
      const user = param.user.length;

      if (connect === 1) {
        if (Boolean(param.connect[0].deactivated)) {
          throw new Unauthorized('The user is not activated, contact the administrator', 'FORM.ERRORS.LOCKED_USER');
        }

        if (permission === 0) {
          throw new Unauthorized('No permissions in the database.', 'ERRORS.NO_PERMISSIONS');
        }
      } else if (connect === 0) {
        if (user === 0) {
          throw new Unauthorized('Bad username and password combination.');
        } else {
          throw new Unauthorized('No permissions for that project.', 'ERRORS.NO_PROJECT');
        }
      }

      return loadSessionInformation(param.connect[0]);
    })
    .then(session => {
      // bind the session variables
      req.session.project = session.project;
      req.session.user = session.user;
      req.session.enterprise = session.enterprise;
      req.session.paths = session.paths;

      // broadcast LOGIN event
      Topic.publish(Topic.channels.APP, {
        event : Topic.events.LOGIN,
        entity : Topic.entities.USER,
        user_id : req.session.user.id,
        id : session.user.id,
      });

      // send the session data back to the client
      res.status(200).json(session);
    })
    .catch(next)
    .done();
}

  /**
   * @method logout
   *
   * Destroys the server side session and sets the user as inactive.
   */
function logout(req, res, next) {
  const sql = 'UPDATE user SET user.active = 0 WHERE user.id = ?;';

  db.exec(sql, [req.session.user.id])
    .then(() => {
      // broadcast LOGOUT event
      Topic.publish(Topic.channels.APP, {
        event : Topic.events.LOGOUT,
        entity : Topic.entities.USER,
        user_id : req.session.user.id,
        id : req.session.user.id,
      });

      // destroy the session
      req.session.destroy();
      res.sendStatus(200);
    })
    .catch(next)
    .done();
}

/**
 * @function loadSessionInformation
 *
 * @description
 * This method takes in a user object (with an id) and loads all the session
 * information about it.  This can be used to populate or refresh req.session
 * in case there are user changes that are made (such as to the enterprise,
 * project, or otherwise).
 *
 * @param {Object} user - the user object to look up the session
 *
 * @returns {Promise} - a promise resolving to the session
 *
 * @private
 */
function loadSessionInformation(user) {
  // this will be the new session
  const session = {};

  let sql = `
    SELECT user.id, user.username, user.display_name, user.email, project.enterprise_id , project.id AS project_id
    FROM user JOIN project_permission JOIN project ON
      user.id = project_permission.user_id AND project.id = project_permission.project_id
    WHERE user.id = ? AND project.id = ?;`;

  return db.exec(sql, [user.id, user.project_id])
    .then(rows => {
      // if no data found, we return a login error
      if (rows.length === 0) {
        throw new InternalServerError(`Server could not locate user with id ${user.id}`);
      }

      // we assume only one match for the user
      session.user = rows[0];

      // next make sure this user has permissions
      sql = `
        SELECT IF(permission.user_id = ?, 1, 0) authorized, unit.path
        FROM unit LEFT JOIN permission
          ON unit.id = permission.unit_id;`;

      return db.exec(sql, [session.user.id]);
    })
    .then(modules => {
      const unauthorized = modules.every(mod => !mod.authorized);

      // if no permissions, notify the user that way
      if (unauthorized) {
        throw new Unauthorized('This user does not have any permissions.');
      }

      session.paths = modules;

      // update the database for when the user logged in
      sql =
        'UPDATE user SET user.active = 1, user.last_login = ? WHERE user.id = ?;';

      return db.exec(sql, [new Date(), session.user.id]);
    })
    .then(() => {
      // we need to construct the session on the client side, including:
      //   the current enterprise
      //   the current project
      sql = `
        SELECT e.id, e.name, e.abbr, e.phone, e.email, BUID(e.location_id) as location_id, e.currency_id,
          c.symbol AS currencySymbol, c.name AS currencyName, e.po_box,
          CONCAT(village.name, ' / ', sector.name, ' / ', province.name) AS location
        FROM enterprise AS e
        JOIN currency AS c ON e.currency_id = c.id
        JOIN village ON village.uuid = e.location_id
        JOIN sector ON sector.uuid = village.sector_uuid
        JOIN province ON province.uuid = sector.province_uuid
        WHERE e.id = ?;
      `;

      return db.exec(sql, [session.user.enterprise_id]);
    })
    .then(rows => {
      if (!rows.length) {
        throw new InternalServerError('There are no enterprises registered in the database!');
      }

      session.enterprise = rows[0];

      sql = `
        SELECT p.id, p.name, p.abbr, p.enterprise_id
        FROM project AS p WHERE p.id = ?;
      `;

      return db.exec(sql, [session.user.project_id]);
    })
    .then(rows => {
      if (!rows.length) {
        throw new Unauthorized('No project matching the provided id.');
      }

      session.project = rows[0];

      return session;
    });
}


/**
 * @method reload
 *
 * @description
 * Uses the same login code to re
 */
function reload(req, res, next) {
  if (!(req.session && req.session.user)) {
    next(new Unauthorized('The user is not signed in.'));
    return;
  }

  // refresh the user's session by manually calling refresh session
  loadSessionInformation(req.session.user)
    .then(session => {
      // bind the session  variables
      req.session.project = session.project;
      req.session.user = session.user;
      req.session.enterprise = session.enterprise;
      req.session.paths = session.paths;

      // broadcast LOGIN event
      Topic.publish(Topic.channels.APP, {
        event : Topic.events.RELOAD,
        entity : Topic.entities.USER,
        user_id : req.session.user.id,
        id : session.user.id,
      });

      // send the session data back to the client
      res.status(200).json(session);
    })
    .catch(next)
    .done();
}
