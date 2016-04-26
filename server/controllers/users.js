/**
* The /users HTTP API endpoint.
*
* This controller is responsible for implementing full CRUD on the user table
* via the /users endpoint.  The following routes are supported:
*   GET /users
*   GET /users/:id
*   GET /users/:id/permissions
*   GET /users/:id/projects
*   POST /users
*   POST /users/:id/permissions
*   POST /users/:id/projects
*   PUT /users/:id
*   PUT /users/:id/password
*   DELETE /users/:id
*/
var db = require('../lib/db');
var q  = require('q');
var NotFound = require('../lib/errors/NotFound');
var BadRequest = require('../lib/errors/BadRequest');

// namespaces for /users/:id/projects and /users/:id/permissions
exports.projects = {};
exports.permissions = {};

/**
* GET /users
*
* If the client queries to /users endpoint, the API will respond with an array
* of zero or more JSON objects, with id, and username keys.
*/
exports.list = function list(req, res, next) {
  'use strict';

  var sql;

  sql =
    `SELECT user.id, CONCAT(user.first, ' ', user.last) AS displayname,
      user.username FROM user;`;

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

// helper function to get a single user, including project details
function lookupUserDetails(id) {
  'use strict';

  var sql, data;

  sql =
    `SELECT user.id, user.username, user.email, user.first, user.last,
      user.active, user.last_login AS lastLogin
    FROM user WHERE user.id = ?;`;

  return db.exec(sql, [id])
  .then(function (rows) {

    if (!rows.length) {
      throw new NotFound(`Could not find an user with id ${id}`);
    }

    // bind user data to ship back
    data = rows[0];

    // query project permissions
    sql =
      `SELECT pp.project_id FROM project_permission AS pp
      WHERE user_id = ?;`;

    return db.exec(sql, [id])
    .then(function (rows) {

      // map into a list of ids
      return rows.map(function (row) {
        return row.project_id;
      });
    });
  })
  .then(function (projects) {
    data.projects = projects;
    return data;
  });
}


/**
* GET /users/:id
*
* This endpoint will return a single JSON object containing the full user row
* for the user with matching ID.  If no matching user exists, it will return a
* 404 error.
*
* For consistency with the CREATE method, this route also returns a user's project
* permissions.
*/
exports.details = function details(req, res, next) {
  'use strict;';

  lookupUserDetails(req.params.id)
  .then(function (data) {
    res.status(200).json(data);
  })
  .catch(next)
  .done();
};

/**
* GET /users/:id/projects
*
* Lists all the user project permissions for user with :id
*/
exports.projects.list = function listProjects(req, res, next) {
  'use strict';

  var sql =
    `SELECT pp.id, pp.project_id, project.name
    FROM project_permission AS pp JOIN project ON pp.project_id = project.id
    WHERE pp.user_id = ?;`;

  db.exec(sql, [req.params.id])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

/**
* GET /users/:id/permissions
*
* Lists all the user permissions for user with :id
*/
exports.permissions.list = function listPermissions(req, res, next) {
  'use strict';

  var sql =
    `SELECT permission.id, permission.unit_id FROM permission
    WHERE permission.user_id = ?;`;

  db.exec(sql, [req.params.id])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};


/**
* POST /users
*
* This endpoint creates a new user from a JSON object.  The following fields are
* required and will result in a 400 error if not provided: username, password,
* first, last, email, projects.
*
* Unlike before, the user is created with project permissions.  A user without project
* access does not make any sense.
*
* If the checks succeed, the user password is hashed and stored in the database.
* A single JSON is returned to the client with the user id.
*/
exports.create = function create(req, res, next) {
  'use strict';

  var sql, requiredKeys, missingKeys, id,
      data = req.body;

  requiredKeys = [
    'username', 'password', 'first', 'last', 'email', 'projects'
  ];

  // if the data object is missing keys, they will be left in the missingKeys
  // array
  missingKeys = requiredKeys.filter(function (key) {
    return !data[key];
  });

  // send a 400 response to the client
  if (missingKeys.length > 0) {
    return res.status(400).json({
      code : 'ERROR.ERR_MISSING_INFO',
      reason: 'A username, password, first name, last name, project list, and email are ' +
              'required to create a user.',
      missingKeys : missingKeys,
    });
  }

  sql =
    'INSERT INTO user (username, password, first, last, email) VALUES ' +
    '(?, PASSWORD(?), ?, ?, ?);';

  db.exec(sql, [data.username, data.password, data.first, data.last, data.email])
  .then(function (row) {

    // retain the insert id
    id = row.insertId;

    sql =
      'INSERT INTO project_permission (user_id, project_id) VALUES ?;';

    var projects = data.projects.map(function (projectId) {
      return [id, projectId];
    });

    return db.exec(sql, [projects]);
  })
  .then(function () {

    // send the ID back to the client
    res.status(201).json({ id : id });
  })
  .catch(next)
  .done();
};


/**
* POST /users/:id/permissions
*
* Creates and updates a user's permissions.
*/
exports.permissions.assign = function assignPermissions(req, res, next) {
  'use strict';

  // first step, DELETE the user's permissions
  var sql =
    'DELETE FROM permission WHERE user_id = ?;';

  db.exec(sql, [req.params.id])
  .then(function () {

    // if there are no permissions registered, just return
    if (!req.body.permissions.length) {
      return;
    }

    // now re-write with the new permissions
    sql =
      'INSERT INTO permission (unit_id, user_id) VALUES ?';

    var data = req.body.permissions.map(function (unitId) {
      return [unitId, req.params.id];
    });

    return db.exec(sql, [data]);
  })
  .then(function () {
    res.status(201).send();
  })
  .catch(next)
  .done();
};


// User update helper function.  Updates a users's project permissions by first
// clearing out all permissions and then re-writing.
function helperUpdateProjectPermissions(id, projects) {
  'use strict';

  var sql;

  // update the user's project permissions by first removing
  // all permissions
  sql =
    'DELETE FROM project_permission WHERE user_id = ?;';

  return db.exec(sql, [id])
  .then(function () {

    // write the user's project permissions back to the database
    sql =
      'INSERT INTO project_permission (user_id, project_id) VALUES ?;';

    // turn into user id and project id pairs
    projects = projects.map(function (projectId) {
      return [ id, projectId ];
    });

    return db.exec(sql, [ projects ]);
  });
}


/**
* PUT /users/:id
*
* This endpoint updates a user's information with ID :id.  If the user is not
* found, the server sends back a 404 error.
*
* This method is reserved for changed all other user properties, but NOT the
* user's password.  To change the user password, use a PUT to users/:id/password
* with two password fields, password and passwordVerify.
*/
exports.update = function update(req, res, next) {
  'use strict';

  var sql, promise,
      data = req.body,
      projects = req.body.projects;

  // if the password is sent the the
  if (data.password) {
    return next(
	  new BadRequest(`The update request attempted to change a protected field.`, `ERRORS.PROTECTED_FIELD`)
	);
  }

  var hasProjects = (projects && projects.length > 0);

  // if we have changed the user's projects, update the project permissions
  // first
  promise = (hasProjects) ?
    helperUpdateProjectPermissions(req.params.id, projects) :
    q.resolve();

  promise
  .then(function () {

    // remove data that should not be updated
    delete data.projects;
    delete data.id;
    delete data.active;

    // if there is nothing to update, simply return.
    if (Object.keys(data).length === 0) {
      return;
    }

    sql =
      'UPDATE user SET ? WHERE id = ?;';

    return db.exec(sql, [data, req.params.id]);
  })
  .then(function () {

    // fetch the entire changed resource to send back to the client
    return lookupUserDetails(req.params.id);
  })
  .then(function (data) {
    res.status(200).json(data);
  })
  .catch(next)
  .done();
};

/**
* PUT /users/:id/password
*
* This endpoint updates a user's password with ID :id.  If the user is not
* found, the server sends back a 404 error.
*/
exports.password = function updatePassword(req, res, next) {
  'use strict';

  // TODO -- strict check to see if the user is either signed in or has
  // sudo permissions.

  var sql =
    'UPDATE user SET password = PASSWORD(?) WHERE id = ?;';

  db.exec(sql, [req.body.password, req.params.id])
  .then(function () {
    return lookupUserDetails(req.params.id);
  })
  .then(function (data) {
    res.status(200).json(data);
  })
  .catch(next)
  .done();
};


/**
* DELETE /users/:id
*
* If the user exists delete it.
*/
exports.delete = function del(req, res, next) {
  'use strict';

  var sql =
    'DELETE FROM user WHERE id = ?;';

  db.exec(sql, [req.params.id])
  .then(function (row) {

    // if nothing happened, let the client know via a 404 error
    if (row.affectedRows === 0) {
      throw new NotFound(`Could not find a user with id ${req.params.id}`);
    }

    res.status(204).send();
  })
  .catch(next)
  .done();
};

// GET /languages
// TODO - where does this actually belong?
exports.getLanguages = function languages(req, res, next) {
  'use strict';

  var sql =
    `SELECT lang.id, lang.name, lang.key, lang.locale_key AS localeKey
    FROM language AS lang;`;

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

// TODO -- remove this.
exports.authenticatePin = function authenticatePin(req, res, next) {
  var decrypt = req.params.pin >> 5;
  var sql = `SELECT pin FROM user WHERE user.id = ' + req.session.user.id
    AND pin = '${decrypt}';`;

  db.exec(sql)
  .then(function (rows) {
    res.send({ authenticated : !!rows.length });
  })
  .catch(function (err) {
    next(err);
  })
  .done();
};

