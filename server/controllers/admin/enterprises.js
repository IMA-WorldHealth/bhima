/**
 * The Enterprises Controller
 *
 * This controller is responsible for creating and updating Enterprises.
 *  Each Enterprise must necessarily have a name, an abbreviation, a geographical location as well as a currency
 *  And it is not possible to remove an Enterprise
 */
const db       = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');

exports.lookupEnterprise = lookupEnterprise;

// GET /enterprises
exports.list = function list(req, res, next) {
  'use strict';

  let sql = 'SELECT id, name, abbr FROM enterprise';

  if (req.query.detailed === '1'){
    sql =
      `SELECT id, name, abbr, email, po_box, phone,
      BUID(location_id) AS location_id, logo, currency_id,
      gain_account_id, loss_account_id
      FROM enterprise;`;
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
  let enterpriseId = req.params.id;
  lookupEnterprise(enterpriseId)
    .then(function (enterprise) {
      res.status(200).json(enterprise);
    })
    .catch(next)
    .done();
};

function lookupEnterprise(id) {
  'use strict';

  let sql =
    `SELECT id, name, abbr, email, po_box, phone,
      BUID(location_id) AS location_id, logo, currency_id,
      gain_account_id, loss_account_id 
    FROM enterprise WHERE id = ?;`;

  return db.exec(sql, [id])
  .then(function (rows) {
    if (!rows.length) {
      throw new NotFound(`Could not find an enterprise with id ${id}`);
    }

    return rows[0];
  });
}


// POST /enterprises
exports.create = function create(req, res, next) {
  'use strict';

  let enterprise = db.convert(req.body.enterprise, ['location_id']);
  let sql =
    'INSERT INTO enterprise SET ?;';

  db.exec(sql, [ enterprise ])
  .then(function (row) {
    res.status(201).json({ id : row.insertId });
  })
  .catch(next)
  .done();
};

// PUT /enterprises/:id
exports.update = function update(req, res, next) {
  'use strict';

  let sql = 'UPDATE enterprise SET ? WHERE id = ?;';
  let data = db.convert(req.body, ['location_id']);
  delete data.id;

  db.exec(sql, [data, req.params.id])
  .then(function (row) {
    if (!row.affectedRows) {
      throw new NotFound(`Could not find an enterprise with id ${req.params.id}`);
    }

    return lookupEnterprise(req.params.id);
  })
  .then(function (enterprise) {
    res.status(200).json(enterprise);
  })
  .catch(next)
  .done();
};
