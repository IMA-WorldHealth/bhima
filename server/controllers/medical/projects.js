/**
* The /projects HTTP API endpoint.
*
* This controller is responsible for implementing full CRUD on the
* project table via the /projects endpoint.
*
* NOTE: this endpoint does not filter for enterprise ID.  We should probably
* move to doing this in the future.
*/
var db = require('../../lib/db');

/**
* GET /projects?complete={0|1}
*
* Returns an array of {id, name} for each project in the database.
*/
exports.list = function list(req, res, next) {
  'use strict';

  var sql;

  // send a larger response if complete is 1
  if (req.query.complete === '1') {
    sql = 'SELECT project.id, project.enterprise_id, project.abbr, ' +
      'project.zs_id, project.name, project.locked ' +
    'FROM project;';
  } else {
    sql =
      'SELECT project.id, project.name FROM project;';
  }

  if (req.query.unlocked === '1') {
    sql = 'SELECT project.id, project.enterprise_id, project.abbr, ' +
      'project.zs_id, project.name, project.locked ' +
    'FROM project WHERE project.locked = \'0\' ;';
  }

  if (req.query.incomplete_unlocked === '1'){
    sql =
      'SELECT project.id, project.name FROM project WHERE project.locked = \'0\';';
  }  


  db.exec(sql)
  .then(function (rows) {
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
exports.details = function details(req, res, next) {
  'use strict';

  var sql =
    'SELECT project.id, project.enterprise_id, project.abbr, ' +
      'project.zs_id, project.name, project.locked ' +
    'FROM project ' +
    'WHERE project.id = ?;';

  db.exec(sql, [ req.params.id ])
  .then(function (rows) {

    // send a 404 if rows is empty
    if (!rows.length) {
      return res.status(404).json({
        code : 'ERR_NOT_FOUND',
        reason : 'No project found by id ' + req.params.id,
      });
    }

    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
};

/**
* POST /projects
*
* Creates a new project.
*/
exports.create = function create(req, res, next) {
  'use strict';

  var sql, data = req.body;

  sql =
    'INSERT INTO project (name, abbr, enterprise_id, zs_id, locked) VALUES (?, ?, ?, ?, ?);';

  db.exec(sql, [data.name, data.abbr, data.enterprise_id, data.zs_id, data.locked])
  .then(function (row) {
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
  'use strict';

  var sql;

  sql =
    'UPDATE project SET ? WHERE id = ?;';

  db.exec(sql, [req.body, req.params.id])
  .then(function () {

    sql =
      'SELECT project.id, project.enterprise_id, project.abbr, ' +
        'project.zs_id, project.name, project.locked ' +
      'FROM project ' +
      'WHERE project.id = ?;';

    return db.exec(sql, [req.params.id]);
  })
  .then(function (rows) {
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
  'use strict';

  var sql =
    'DELETE FROM project WHERE id = ?;';

  db.exec(sql, [req.params.id])
  .then(function (row) {

    // if nothing happened, let the client know via a 404 error
    if (row.affectedRows === 0) {
      return res.status(404).send();
    }

    res.status(204).send();
  })
  .catch(next)
  .done();
};
