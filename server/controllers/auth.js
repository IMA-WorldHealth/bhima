// responsible for authentication routes

var db = require('../lib/db');

// POST /login
// This route will accept a login request with the
// username, password and project id for user.  Upon
// successful login, it creates a user session with
// all enterprise, project, and user data for easy access.
exports.login = function login(req, res, next) {
  'use strict';

  var sql,
      user, enterprise, project,
      username = req.body.username,
      password = req.body.password,
      projectId = req.body.project;

  sql =
    'SELECT user.id, user.username, user.first, user.last, user.email, project.enterprise_id , project.id AS project_id ' +
    'FROM user JOIN project_permission JOIN project ON ' +
      'user.id = project_permission.user_id AND project.id = project_permission.project_id ' +
    'WHERE user.username = ? AND user.password = PASSWORD(?) AND project_permission.project_id = ?;';

  db.exec(sql, [username, password, projectId])
  .then(function (rows) {

    // if no data found, we return a login error
    if (rows.length < 1) {
      throw new req.codes.ERR_BAD_CREDENTIALS();
    }

    // we assume only one match for the user
    user = rows[0];

    // next make sure this user has permissions
    sql =
      'SELECT user_id, unit_id FROM permission WHERE user_id = ?';

    return db.exec(sql, [user.id]);
  })
  .then(function (rows) {

    // if no permissions, notify the user that way
    if (rows.length === 0) {
      throw new req.codes.ERR_NO_PERMISSIONS();
    }

    // update the database for when the user logged in
    sql = 'UPDATE user SET user.active = 1, user.last_login = ? WHERE user.id = ?;';
    return db.exec(sql, [new Date(), user.id]);
  })
  .then(function () {

    // we need to construct the session on the client side, including:
    //   the current enterprise
    //   the current project
    sql =
      'SELECT e.id, e.name, e.abbr, e.phone, e.email, e.location_id, e.currency_id, ' +
        'c.symbol AS currencySymbol, e.po_box ' +
      'FROM enterprise AS e JOIN currency AS c ON e.currency_id = c.id ' +
      'WHERE e.id = ?;';

    return db.exec(sql, [user.enterprise_id]);
  })
  .then(function (rows) {
    if (rows.length === 0) {
      throw new req.codes.ERR_NO_ENTERPRISE();
    }

    enterprise = rows[0];

    sql =
      'SELECT p.id, p.name, p.abbr, p.enterprise_id ' +
      'FROM project AS p WHERE p.id = ?;';
    return db.exec(sql, [user.project_id]);
  })
  .then(function (rows) {
    if (rows.length === 0) {
      throw new req.codes.ERR_NO_PROJECT();
    }

    project = rows[0];

    // commit the session variables
    req.session.user = user;
    req.session.enterprise = enterprise;
    req.session.project = project;

    // send the data back to the client
    res.status(200).json({
      user : user,
      enterprise : enterprise,
      project : project
    });
  })
  .catch(next)
  .done();
};

// GET  /logout
// Destroys a user's session
exports.logout = function logout(req, res, next) {

  var sql =
    'UPDATE user SET user.active = 0 WHERE user.id = ?';

  db.exec(sql, [req.session.user.id])
  .then(function () {
    req.session.destroy();
    res.status(200).send();
  })
  .catch(next)
  .done();
};
