/**
* Enterprises Controller
*
* This controller is responsible for creating and updating Enterprises.
*  Each Enterprise must necessarily have a name, an abbreviation, a geographical location as well as a currency
*  And it is not possible to remove an Enterprise
*/
var db = require('../../lib/db');

// converts uuids appropriately
function convert(data) {
  if (data.location_id) {
    data.location_id = db.bid(data.location_id);
  }

  return data;
}

// GET /enterprises
exports.list = function list(req, res, next) {
  'use strict';
  var sql;

  sql = 'SELECT id, name, abbr FROM enterprise';

  if (req.query.detailed === '1'){
    sql =
      'SELECT id, name, abbr, email, po_box, phone, BUID(location_id) as location_id, logo, currency_id FROM enterprise;';
  }

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};


// GET /enterprises/:id
exports.detail = function detail(req, res, next) {
  'use strict';
  var sql;
  var enterpriseId = req.params.id;

  sql =
    'SELECT id, name, abbr, email, po_box, phone, BUID(location_id) as location_id, logo, currency_id ' +
    'FROM enterprise WHERE id = ?';

  db.exec(sql, [enterpriseId])
  .then(function (rows) {
    if (!rows.length) {
      throw new req.codes.ERR_NOT_FOUND();
    }
    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
};


// POST /enterprises
exports.create = function create(req, res, next) {
  'use strict';
  var enterprise = convert(req.body.enterprise),
    writeEnterpriseQuery;

  if (!enterprise.name && !enterprise.abbr && !enterprise.location_id && !enterprise.currency_id ) {
    res.status(400).json({
      code : 'ERR_INVALID_REQUEST',
      reason : 'A valid Enterprise must be have name, abbrevation, location and Currency '
    });
    return;
  }

  writeEnterpriseQuery = 'INSERT INTO enterprise (name, abbr, phone, email, location_id, logo, currency_id, po_box) VALUES (?);';

  db.exec(writeEnterpriseQuery, [[
    enterprise.name, enterprise.abbr, enterprise.phone, enterprise.email,
    enterprise.location_id, enterprise.logo, enterprise.currency_id, enterprise.po_box
  ]])
  .then(function (row) {
    res.status(201).json({ id : row.insertId });
  })
  .catch(next)
  .done();
};

// PUT /enterprises/:id
exports.update = function update(req, res, next) {
  'use strict';
  var sql;
  var enterpriseId = req.params.id;
  var queryData = convert(req.body);

  delete queryData.id;

  sql = 'UPDATE enterprise SET ? WHERE id = ?;';

  db.exec(sql, [queryData, enterpriseId])
  .then(function (row) {
    if (!row.affectedRows) {
      throw new req.codes.ERR_NOT_FOUND();
    }

    var sql2 = 'SELECT id, name, abbr, phone, email, location_id, logo, currency_id, po_box FROM enterprise WHERE id = ?;';

    return db.exec(sql2, [enterpriseId]);
  })
  .then(function (rows) {
    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
};

