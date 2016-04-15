/**
* Creditor Groups  Controller
*
* This controller exposes an API to the client for reading and creditor_groups 

*/
var db = require('../../lib/db');
var NotFound = require('../../lib/errors/NotFound');
const uuid = require('node-uuid');

// GET /creditor_groups 
function lookupCreditorGroup(uuid) {
  'use strict';

  var sql =
    'SELECT enterprise_id, BUID(uuid) as uuid, name, account_id, locked ' +
    'FROM creditor_group ' +
    'WHERE creditor_group.uuid = ? ';

  return db.exec(sql, [uuid])
  .then(function (rows) {
    if (rows.length === 0) {
      throw new NotFound(`Could not find a debtor with uuid ${uuid}`);
    }
    return rows[0];
  });
}


// Lists of Creditor Groups
function list(req, res, next) {
  'use strict';
  
  let sql =
    'SELECT BUID(uuid) as uuid, name FROM creditor_group ;';

  if (req.query.detailed === '1'){
    sql =
      'SELECT enterprise_id, BUID(uuid) as uuid, name, account_id, locked ' +
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
* GET /creditor_groups/:uuid
*
* Returns the detail of a single Creditor Group 
*/
function detail(req, res, next) {
  'use strict';

  const uid = db.bid(req.params.uuid);

  lookupCreditorGroup(uid)
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
   
  // provide UUID if the client has not specified 
  data.uuid = db.bid(data.uuid || uuid.v4());
    
  sql =
    'INSERT INTO creditor_group SET ? ';

  db.exec(sql, [data])
  .then(function (row) {
    res.status(201).json({ uuid : uuid.unparse(data.uuid) });
  })
  .catch(next)
  .done();
}


// PUT /creditor_groups/:uuid 
function update(req, res, next) {
  'use strict';

  let sql =
    'UPDATE creditor_group SET ? WHERE uuid = ?;';

  const uid = db.bid(req.params.uuid);

  db.exec(sql, [req.body, uid])
  .then(function () {
    return lookupCreditorGroup(uid);
  })
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}

// get list of creditor group
exports.list = list;

// get details of a creditor group
exports.detail = detail;

// create a new creditor group
exports.create = create;

// update creditor group informations
exports.update = update;
