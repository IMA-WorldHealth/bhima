/**
* Supplier Controller
*
* This controller exposes an API to the client for reading and writing Supplier

*/
var db = require('../../lib/db');
var uuid = require('../../lib/guid');
// GET /Supplier
//

function lookupSupplier(uuid, codes) {
  'use strict';

  var record;

  var sql =
    'SELECT supplier.uuid, supplier.creditor_uuid, supplier.name, supplier.address_1, supplier.address_2, supplier.email, ' +
    'supplier.fax, supplier.note, supplier.phone, supplier.international, supplier.locked ' +
    'FROM supplier ' +
    'WHERE supplier.uuid = ? ';

  return db.exec(sql, [uuid])
  .then(function (rows) {

    if (rows.length === 0) {
      throw new codes.ERR_NOT_FOUND();
    }

    // store the record for return
    record = rows[0];

    return record;
  });
}


// The Supplier  is assumed from the session.
function list(req, res, next) {
  'use strict';

  var sql;
  
  sql =
    'SELECT supplier.uuid, supplier.creditor_uuid, supplier.name, supplier.address_1, supplier.address_2, supplier.email, ' +
    'supplier.fax, supplier.note, supplier.phone, supplier.international, supplier.locked ' +
    'FROM supplier ';

  if (req.query.locked === '0') {
    sql += 'WHERE supplier.locked = 0 ';
  }

  if (req.query.locked === '1') {
    sql += 'WHERE supplier.locked = 1 ';     
  }

  db.exec(sql)
  .then(function (rows) {

    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
* GET /Supplier/:UUID
*
* Returns the detail of a single Supplier
*/
function detail(req, res, next) {
  'use strict';

  var uuid = req.params.uuid;

  lookupSupplier(uuid, req.codes)
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}


// POST /Supplier
function create(req, res, next) {
  'use strict';

  var sql,
      data = req.body;

  // Provide UUID if the client has not specified 
  data.uuid = data.uuid || uuid();
    
  sql =
    'INSERT INTO supplier SET ? ';

  db.exec(sql, [data])
  .then(function (row) {
    res.status(201).json({ uuid : data.uuid });
  })
  .catch(next)
  .done();
}


// PUT /Supplier /:uuid 
function update(req, res, next) {
  'use strict';

  var sql;

  sql =
    'UPDATE supplier SET ? WHERE uuid = ?;';

  db.exec(sql, [req.body, req.params.uuid])
  .then(function () {
    var uuid = req.params.uuid;
    return lookupSupplier(uuid, req.codes);
  })
  .then(function (record) {
    // all updates completed successfull, return full object to client
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}

function filter(req, res, next) { 
  var sql;
  var limit = Number(req.query.limit);

  var name = req.query.name;   
  var condition = '%' + name + '%';

  sql =
    'SELECT supplier.uuid, supplier.creditor_uuid, supplier.name, supplier.address_1, supplier.address_2, supplier.email, ' +
    'supplier.fax, supplier.note, supplier.phone, supplier.international, supplier.locked ' +
    'FROM supplier ' +
    'WHERE supplier.name LIKE ? ';

  if (limit && typeof(limit) === 'number') {
    sql += ' LIMIT ' + Math.floor(limit) + ';';
  }

  db.exec(sql, [condition])
  .then(function (rows) {

    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

exports.list = list;

exports.detail = detail;

exports.create = create;

exports.update = update;

exports.filter = filter;
