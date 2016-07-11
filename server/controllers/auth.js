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
'use strict';

const db = require('../lib/db');
const Unauthorized = require('../lib/errors/Unauthorized');
const Forbidden = require('../lib/errors/Forbidden');
const InternalServerError = require('../lib/errors/InternalServerError');
const Topic = require('../lib/topic');

// POST /login
exports.login = login;

// GET /logout
exports.logout = logout;

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
  let username = req.body.username;
  let password = req.body.password;
  let projectId = req.body.project;

  const session = {};

  let sql = `
    SELECT user.id, user.username, user.first, user.last, user.email, project.enterprise_id , project.id AS project_id
    FROM user JOIN project_permission JOIN project ON
      user.id = project_permission.user_id AND project.id = project_permission.project_id
    WHERE user.username = ? AND user.password = PASSWORD(?) AND project_permission.project_id = ?;
  `;

  db.exec(sql, [username, password, projectId])
  .then(function (rows) {

    // if no data found, we return a login error
    if (rows.length === 0) {
      throw new Unauthorized('Bad username and password combination.');
    }

    // we assume only one match for the user
    session.user = rows[0];

    // next make sure this user has permissions
    sql =
      `SELECT p.user_id, p.unit_id, u.path
        FROM permission AS p
        JOIN unit AS u ON u.id = p.unit_id
        WHERE p.user_id = ? `;

    return db.exec(sql, [session.user.id]);
  })
  .then(function (rows) {

    // if no permissions, notify the user that way
    if (rows.length === 0) {
      throw new Unauthorized('This user does not have any permissions.');
    }

    session.path = rows;

    // update the database for when the user logged in
    sql =
      'UPDATE user SET user.active = 1, user.last_login = ? WHERE user.id = ?;';

    return db.exec(sql, [new Date(), session.user.id]);
  })
  .then(function () {

    // we need to construct the session on the client side, including:
    //   the current enterprise
    //   the current project
    sql = `
      SELECT e.id, e.name, e.abbr, e.phone, e.email, BUID(e.location_id) as location_id, e.currency_id,
        c.symbol AS currencySymbol, e.po_box
      FROM enterprise AS e JOIN currency AS c ON e.currency_id = c.id
      WHERE e.id = ?;
    `;

    return db.exec(sql, [session.user.enterprise_id]);
  })
  .then(function (rows) {

    if (rows.length === 0) {
      throw new InternalServerError('There are no enterprises registered in the database!');
    }

    session.enterprise = rows[0];

    sql = `
      SELECT p.id, p.name, p.abbr, p.enterprise_id
      FROM project AS p WHERE p.id = ?;
    `;

    return db.exec(sql, [session.user.project_id]);
  })
  .then(function (rows) {
    if (rows.length === 0) {
      throw new Unauthorized('No project matching the provided id.');
    }

    session.project = rows[0];

    // session language
    session.lang = req.body.lang;


    // bind the session variables
    req.session.project = session.project;
    req.session.user = session.user;
    req.session.enterprise = session.enterprise;
    req.session.path = session.path;
    req.session.lang = session.lang;

    // broadcast LOGIN event
    Topic.publish(Topic.channels.APP, {
      event: Topic.events.LOGIN,
      entity: Topic.entities.USER,
      user_id : req.session.user.id,
      id: session.user.id
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
  let sql =
    'UPDATE user SET user.active = 0 WHERE user.id = ?;';

  db.exec(sql, [req.session.user.id])
  .then(() => {

    // broadcast LOGOUT event
    Topic.publish(Topic.channels.APP, {
      event: Topic.events.LOGOUT,
      entity: Topic.entities.USER,
      user_id : req.session.user.id,
      id: req.session.user.id,
    });

    // destroy the session
    req.session.destroy();
    res.sendStatus(200);
  })
  .catch(next)
  .done();
}
