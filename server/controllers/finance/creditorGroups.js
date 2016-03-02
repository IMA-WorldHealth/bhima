/**
* Creditor Groups  Controller
*
* This controller exposes an API to the client for reading and creditor_groups 

*/
var db = require('../../lib/db');
var uuid = require('node-uuid');

// GET /creditor_groups 
function lookupCreditorGroup (uuid, codes) {
  'use strict';

  var sql =
    'SELECT enterprise_id, uuid, name, account_id, locked ' +
    'FROM creditor_group ' +
    'WHERE creditor_group.uuid = ? ';

  return db.exec(sql, [uuid])
  .then(function (rows) {

    if (rows.length === 0) {
      throw new codes.ERR_NOT_FOUND();
    }

    return rows[0];

  });
}


// Lists of Creditor Groups
function list(req, res, next) {
  'use strict';

  var sql;
  
  sql =
    'SELECT uuid, name FROM creditor_group ;';

  if (req.query.detailed === '1'){
    sql =
      'SELECT enterprise_id, uuid, name, account_id, locked ' +
      'FROM creditor_group ;';
  }

  db.exec(sql)
  .then(function (rows) {

    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
* GET /CREDITOR_GROUPS/:UUID
*
* Returns the detail of a single Creditor Group 
*/
function detail(req, res, next) {
  'use strict';

  lookupCreditorGroup (req.params.uuid, req.codes)
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}


// POST/CREDITOR_GROUPS 
function create(req, res, next) {
  'use strict';

  var sql,
      data = req.body;
   
  // Provide UUID if the client has not specified 
  data.uuid = data.uuid || uuid.v4();
    
  sql =
    'INSERT INTO creditor_group SET ? ';

  db.exec(sql, [data])
  .then(function (row) {
    res.status(201).json({ uuid : data.uuid });
  })
  .catch(next)
  .done();
}


// PUT /CREDITOR_GROUPS/:UUID 
function update(req, res, next) {
  'use strict';

  var sql;

  sql =
    'UPDATE creditor_group SET ? WHERE uuid = ?;';

  db.exec(sql, [req.body, req.params.uuid])
  .then(function () {
    var uuid = req.params.uuid;
    return lookupCreditorGroup (uuid, req.codes);
  })
  .then(function (record) {
    // all updates completed successfull, return full object to client
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}

// get list of Creditor Group
exports.list = list;

// get details of a Creditor Group
exports.detail = detail;

// create a new Creditor Group
exports.create = create;

// update Creditor Group informations
exports.update = update;
