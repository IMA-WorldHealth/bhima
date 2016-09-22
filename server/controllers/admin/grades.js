'use strict';

/**
 * Grade Controller
 *
 * This controller exposes an API to the client for reading and writing Grade
 */
const  db = require('../../lib/db');
const  uuid = require('node-uuid');
const  NotFound = require('../../lib/errors/NotFound');

// GET /Grade
function lookupGrade(uid) {
  const sql = `
    SELECT BUID(uuid) as uuid, code, text, basic_salary
    FROM grade
    WHERE grade.uuid = ?;
  `;

  return db.one(sql, [db.bid(uid)], uid, 'grade');
}


// Lists of grades of hospital employees.
function list(req, res, next) {

  let sql =
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

  lookupGrade(req.params.uuid)
    .then(function (record) {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}


// POST /grade
function create(req, res, next) {

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

  var sql =
    'UPDATE grade SET ? WHERE uuid = ?;';

  // make sure you cannot update the uuid
  delete req.body.uuid;

  const uid = db.bid(req.params.uuid);

  db.exec(sql, [req.body, uid])
    .then(() => lookupGrade(req.params.uuid))
    .then(record => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// DELETE /grade/:uuid
function del(req, res, next) {

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
