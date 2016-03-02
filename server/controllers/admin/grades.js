/**
* Grade  Controller
*
* This controller exposes an API to the client for reading and writing Grade 

*/
var db = require('../../lib/db');
var uuid = require('node-uuid');

// GET /Grade 
function lookupGrade (uuid, codes) {
  'use strict';

  var sql =
    'SELECT uuid, code, text, basic_salary ' +
    'FROM grade ' +
    'WHERE grade.uuid = ? ';

  return db.exec(sql, [uuid])
  .then(function (rows) {

    if (rows.length === 0) {
      throw new codes.ERR_NOT_FOUND();
    }

    return rows[0];

  });
}


// Lists of grades of hospital employees.
function list(req, res, next) {
  'use strict';

  var sql;
  
  sql =
    'SELECT uuid, text FROM grade ;';

  if (req.query.detailed === '1'){
    sql =
      'SELECT uuid, code, text, basic_salary FROM grade ;';
  }

  db.exec(sql)
  .then(function (rows) {

    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
* GET /Grade /:UUID
*
* Returns the detail of a single Grade 
*/
function detail(req, res, next) {
  'use strict';

  lookupGrade (req.params.uuid, req.codes)
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}


// POST /Grade 
function create(req, res, next) {
  'use strict';

  var sql,
      data = req.body;
   
  // Provide UUID if the client has not specified 
  data.uuid = data.uuid || uuid.v4();
    
  sql =
    'INSERT INTO grade SET ? ';

  db.exec(sql, [data])
  .then(function (row) {
    res.status(201).json({ uuid : data.uuid });
  })
  .catch(next)
  .done();
}


// PUT /Grade  /:uuid 
function update(req, res, next) {
  'use strict';

  var sql;

  sql =
    'UPDATE grade SET ? WHERE uuid = ?;';

  db.exec(sql, [req.body, req.params.uuid])
  .then(function () {
    var uuid = req.params.uuid;
    return lookupGrade (uuid, req.codes);
  })
  .then(function (record) {
    // all updates completed successfull, return full object to client
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}

// DELETE /Grade/:uuid
function del(req, res, next) {
  'use strict';

  var sql =
    'DELETE FROM grade WHERE uuid = ?;';

  db.exec(sql, [req.params.uuid])
  .then(function (row) {

    // if nothing happened, let the client know via a 404 error
    if (row.affectedRows === 0) {
      throw new req.codes.ERR_NOT_FOUND();
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
