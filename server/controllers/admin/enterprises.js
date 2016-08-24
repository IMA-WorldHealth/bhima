/**
 * The Enterprises Controller
 *
 * This controller is responsible for creating and updating Enterprises.
 *  Each Enterprise must necessarily have a name, an abbreviation, a geographical location as well as a currency
 *  And it is not possible to remove an Enterprise
 */
'use strict';

const db       = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');

exports.lookupEnterprise = lookupEnterprise;
exports.lookupByProjectId = lookupByProjectId;

// GET /enterprises
exports.list = function list(req, res, next) {

  let sql = 'SELECT id, name, abbr FROM enterprise';

  if (req.query.detailed === '1') {
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
  let enterpriseId = req.params.id;
  lookupEnterprise(enterpriseId)
    .then(function (enterprise) {
      res.status(200).json(enterprise);
    })
    .catch(next)
    .done();
};

function lookupEnterprise(id) {
  const sql = `
    SELECT id, name, abbr, email, po_box, phone,
      BUID(location_id) AS location_id, logo, currency_id,
      gain_account_id, loss_account_id
    FROM enterprise WHERE id = ?;
  `;

  return db.exec(sql, [id])
  .then(function (rows) {
    if (!rows.length) {
      throw new NotFound(`Could not find an enterprise with id ${id}.`);
    }

    return rows[0];
  });
}

/**
 * @method lookupByProjectId
 *
 * @description
 * Finds an enterprise via a project id.  This method is useful since most
 * tables only store the project_id instead of the enterprise_id.
 *
 * @param {Number} id - the project id to lookup
 * @returns {Promise} - the result of the database query.
 */
function lookupByProjectId(id) {
  const sql = `
    SELECT e.id, e.name, e.abbr, email, e.po_box, e.phone,
      BUID(e.location_id) AS location_id, e.logo, e.currency_id,
      e.gain_account_id, e.loss_account_id
    FROM enterprise AS e JOIN project AS p ON e.id = p.enterprise_id
    WHERE p.enterprise_id = ?;
  `;

  return db.exec(sql, [id])
    .then(function (rows) {
      if (!rows.length) {
        throw new NotFound(`Could not find an enterprise with project id ${id}.`);
      }

      return rows[0];
    });
}

// POST /enterprises
exports.create = function create(req, res, next) {
  const enterprise = db.convert(req.body.enterprise, ['location_id']);
  const sql = 'INSERT INTO enterprise SET ?;';

  db.exec(sql, [ enterprise ])
    .then(function (row) {
      res.status(201).json({ id : row.insertId });
    })
    .catch(next)
    .done();
};

// PUT /enterprises/:id
exports.update = function update(req, res, next) {
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
