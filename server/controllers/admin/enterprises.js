/**
* Enterprises Controller
*
* This controller is responsible for creating and updating Enterprises.  Every
*/
var db = require('../../lib/db');


exports.list = function list(req, res, next) {
  'use strict';

  var sql;

  sql =
    'SELECT id, name, abbr, email, po_box, phone, location_id, logo, currency_id FROM enterprise';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

// get Enterprises
function helperGetEnterprise(id, codes) {
  'use strict';

  var sql;

  sql =
    'SELECT id, name, abbr, email, po_box, phone, location_id, logo, currency_id FROM enterprise ' +
    'WHERE id = ?;';

  return db.exec(sql, [id])
  .then(function (rows) {

    if (!rows.length) {
      throw codes.NOT_FOUND;
    }
  });
}

// POST /enterprises
exports.create = function create(req, res, next) {
  'use strict';

  var enterprise = req.body.enterprises,
    writeEnterpriseQuery;
  
  writeEnterpriseQuery = 'INSERT INTO enterprise (name, abbr, phone, email, location_id, logo, currency_id, po_box) VALUES (?);';

  db.exec(writeEnterpriseQuery, [[enterprise.name, enterprise.abbr, enterprise.phone, enterprise.email,
    enterprise.location_id, enterprise.logo, enterprise.currency_id, enterprise.po_box]])
  .then(function (row) {
    res.status(201).json({ id : row.insertId });
  })
  .catch(next)
  .done();
};

// PUT /Enterprises/:id
exports.update = function update(req, res, next) {
  'use strict';
  var sql;

  sql = 'UPDATE enterprise SET ? WHERE id = ?;';

  db.exec(sql, [req.body, req.params.id])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

