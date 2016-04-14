/**
* Supplier Controller
*
* This controller exposes an API to the client for reading and writing Supplier
*/

const db = require('../../lib/db');
const uuid = require('node-uuid');
var NotFound = require('../../lib/errors/NotFound');

function lookupSupplier(uuid, codes) {
  'use strict';

  var record;

  var sql =
    `SELECT BUID(supplier.uuid) as uuid, BUID(supplier.creditor_uuid) as creditor_uuid, supplier.name,
      supplier.address_1, supplier.address_2, supplier.email, supplier.fax, supplier.note,
      supplier.phone, supplier.international, supplier.locked
    FROM supplier
    WHERE supplier.uuid = ?`;

  return db.exec(sql, [uuid])
  .then(function (rows) {

    if (rows.length === 0) {
      throw new NotFound(`Could not find a Supplier with uuid ${uuid}`);
    }

    return rows[0];
  });
}


// The Supplier  is assumed from the session.
function list(req, res, next) {
  'use strict';

  var sql;

  sql =
    `SELECT BUID(supplier.uuid) as uuid, BUID(supplier.creditor_uuid) as creditor_uuid,
      supplier.name, supplier.address_1, supplier.address_2, supplier.email,
      supplier.fax, supplier.note, supplier.phone, supplier.international, supplier.locked
    FROM supplier `;

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
* GET /supplier/:uuid
*
* Returns the detail of a single Supplier
*/
function detail(req, res, next) {
  'use strict';

  const uid = db.bid(req.params.uuid);

  lookupSupplier(uid)
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}

// convert uuids to binary uuids in preparation for database insertion
function convert(data) {

  if (data.creditor_uuid) {
    data.creditor_uuid = db.bid(data.creditor_uuid);
  }

  return data;
}


// POST /supplier
function create(req, res, next) {
  'use strict';

  var data = convert(req.body);

  // provide uuid if the client has not specified
  data.uuid = db.bid(data.uuid || uuid());

  var sql =
    'INSERT INTO supplier SET ? ';

  db.exec(sql, [data])
  .then(function (row) {
    res.status(201).json({ uuid : uuid.unparse(data.uuid) });
  })
  .catch(next)
  .done();
}


// PUT /supplier/:uuid
function update(req, res, next) {
  'use strict';

  const uid = db.bid(req.params.uuid);

  var sql =
    'UPDATE supplier SET ? WHERE uuid = ?;';

  var data = convert(req.body);

  // prevent updating the uuid
  delete data.uuid;

  db.exec(sql, [data, uid])
  .then(function () {
    return lookupSupplier(uid);
  })
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}

// GET /SUPPLIER/SEARCH
function search(req, res, next) {
  var sql;
  var limit = Number(req.query.limit);

  var name = req.query.name;
  var condition = '%' + name + '%';

  sql =
    `SELECT BUID(supplier.uuid) as uuid, BUID(supplier.creditor_uuid) as creditor_uuid, supplier.name,
      supplier.address_1, supplier.address_2, supplier.email,
      supplier.fax, supplier.note, supplier.phone, supplier.international, supplier.locked
    FROM supplier
    WHERE supplier.name LIKE ?;`;

  if (limit) {
    sql += ' LIMIT ' + Math.floor(limit) + ';';
  }

  db.exec(sql, [condition])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}


// get list of a supplier
exports.list = list;

// get details of a supplier
exports.detail = detail;

// create a new supplier
exports.create = create;

// update supplier informations
exports.update = update;

// search suppliers data
exports.search = search;
