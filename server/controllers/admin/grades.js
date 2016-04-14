/**
 * Grade Controller
 *
 * This controller exposes an API to the client for reading and writing Grade
 */
var db = require('../../lib/db');
var uuid = require('node-uuid');
var NotFound = require('../../lib/errors/NotFound');

// GET /Grade
function lookupGrade(uid, codes) {
  'use strict';

  var sql =
    'SELECT BUID(uuid) as uuid, code, text, basic_salary ' +
    'FROM grade ' +
    'WHERE grade.uuid = ? ';

  return db.exec(sql, [uid])
  .then(function (rows) {

    if (rows.length === 0) {
      throw new NotFound(`Could not find a grade with uuid ${uuid.unparse(uid)}`);
    }

    return rows[0];
  });
}


// Lists of grades of hospital employees.
function list(req, res, next) {
  'use strict';

  var sql;

  sql =
    'SELECT BUID(uuid) as uuid, text FROM grade ;';

  if (req.query.detailed === '1') {
    sql =
      'SELECT BUID(uuid) as uuid, code, text, basic_salary FROM grade ;';
  }

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
* GET /grade/:uuid
*
* Returns the detail of a single Grade
*/
function detail(req, res, next) {
  'use strict';

  const uid = db.bid(req.params.uuid);

  lookupGrade(uid)
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}


// POST /grade
function create(req, res, next) {
  'use strict';

  var sql,
      data = req.body;

  // Provide UUID if the client has not specified
  data.uuid = db.bid(data.uuid || uuid.v4());

  sql =
    'INSERT INTO grade SET ? ';

  db.exec(sql, [data])
  .then(function (row) {
    res.status(201).json({ uuid : uuid.unparse(data.uuid) });
  })
  .catch(next)
  .done();
}


// PUT /grade /:uuid
function update(req, res, next) {
  'use strict';

  var sql =
    'UPDATE grade SET ? WHERE uuid = ?;';

  // make sure you cannot update the uuid
  delete req.body.uuid;

  const uid = db.bid(req.params.uuid);

  db.exec(sql, [req.body, uid])
  .then(function () {
    return lookupGrade(uid);
  })
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}

// DELETE /grade/:uuid
function del(req, res, next) {
  'use strict';

  var sql =
    'DELETE FROM grade WHERE uuid = ?;';

  db.exec(sql, [db.bid(req.params.uuid)])
  .then(function (row) {

    // if nothing happened, let the client know via a 404 error
    if (row.affectedRows === 0) {
      throw new NotFound(`Could not find a Grade with uuid ${db.bid(req.params.uuid)}`);
    }

    res.status(204).json();
  })
  .catch(next)
  .done();
}


// get list of Grade
exports.list = list;

// get details of a Grade
exports.detail = detail;

// create a new Grade
exports.create = create;

// update grade informations
exports.update = update;

// Delete a Grade
exports.delete = del;
