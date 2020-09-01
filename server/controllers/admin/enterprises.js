/**
 * The Enterprises Controller
 *
 * This controller is responsible for creating and updating Enterprises.
 * Each enterprise must necessarily have a name, an abbreviation, a geographical
 * location as well as a currency and it is not possible to remove an enterprise.
 */

const _ = require('lodash');

const db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');
const BadRequest = require('../../lib/errors/BadRequest');

exports.lookupEnterprise = lookupEnterprise;
exports.lookupByProjectId = lookupByProjectId;

// GET /enterprises
exports.list = function list(req, res, next) {
  let sql = 'SELECT id, name, abbr FROM enterprise';

  if (req.query.detailed === '1') {
    sql = `
      SELECT e.id, e.name, e.abbr, e.email, e.po_box, e.phone, e.address,
        BUID(e.location_uuid) AS location_uuid, e.logo, e.currency_id,
        e.gain_account_id, e.loss_account_id, e.location_default_type_root,
      s.enable_price_lock, s.enable_prepayments, s.enable_delete_records,
      s.enable_password_validation, s.enable_balance_on_invoice_receipt,
        s.enable_barcodes, s.enable_auto_stock_accounting,
        s.enable_auto_purchase_order_confirmation,
        s.enable_auto_email_report, s.enable_index_payment_system,
        s.month_average_consumption, s.enable_daily_consumption,
        l.id AS location_id
      FROM enterprise AS e
        JOIN location AS l ON l.uuid = e.location_uuid
        LEFT JOIN enterprise_setting AS s ON e.id = s.enterprise_id
      ;`;
  }

  db.exec(sql)
    .then(rows => {
      let data = rows;

      // FIXME(@jniles) - this is kinda hacky.  The idea is to keep settings
      // separate in a JSON file.  This will make more sense as we add enterprise
      // options.
      if (req.query.detailed === '1') {
        data = rows.map(row => {
          const settings = [
            'enable_price_lock',
            'enable_prepayments',
            'enable_delete_records',
            'enable_password_validation',
            'enable_balance_on_invoice_receipt',
            'enable_barcodes',
            'enable_auto_stock_accounting',
            'enable_auto_purchase_order_confirmation',
            'enable_auto_email_report',
            'enable_index_payment_system',
            'month_average_consumption',
            'enable_daily_consumption',
          ];

          row.settings = _.pick(row, settings);
          return _.omit(row, settings);
        });

      }

      res.status(200).json(data);
    })
    .catch(next)
    .done();
};

// GET /enterprises/:id
exports.detail = function detail(req, res, next) {
  lookupEnterprise(req.params.id)
    .then(enterprise => {
      res.status(200).json(enterprise);
    })
    .catch(next)
    .done();
};

function lookupEnterprise(id) {
  const sql = `
    SELECT e.id, e.name, e.abbr, e.email, e.po_box, e.phone, e.address,
      BUID(e.location_uuid) AS location_uuid, e.logo, e.currency_id,
      e.gain_account_id, e.loss_account_id, e.location_default_type_root,
      l.id AS location_id
    FROM enterprise AS e
    JOIN location AS l ON l.uuid = e.location_uuid
    WHERE e.id = ?;
  `;

  const settingsSQL = `
    SELECT
      *
    FROM enterprise_setting WHERE enterprise_id = ?;
  `;

  let enterprise;

  return db.one(sql, [id], id, 'enterprise')
    .then(data => {
      enterprise = data;
      return db.exec(settingsSQL, id);
    })
    .then(settings => {
      enterprise.settings = settings[0] || {};
      return enterprise;
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
    SELECT e.id, e.name, e.abbr, e.email, e.address, e.po_box, e.phone,
      BUID(e.location_uuid) AS location_uuid, e.logo, e.currency_id,
      e.gain_account_id, e.loss_account_id, location.id AS location_id 
    FROM enterprise AS e JOIN project AS p ON e.id = p.enterprise_id
    JOIN location ON e.location_uuid = location.uuid
    WHERE p.id = ?
    LIMIT 1;
  `;

  return db.exec(sql, [id])
    .then((rows) => {
      if (!rows.length) {
        throw new NotFound(`Could not find an enterprise with project id ${id}.`);
      }

      return rows[0];
    });
}

// POST /enterprises
exports.create = function create(req, res, next) {
  const enterprise = db.convert(req.body.enterprise, ['location_uuid']);

  const sql = 'INSERT INTO enterprise SET ?;';

  db.exec(sql, [enterprise])
    .then(row => {
      res.status(201).json({ id : row.insertId });
    })
    .catch(next)
    .done();
};

// PUT /enterprises/:id
exports.update = function update(req, res, next) {

  const sql = 'UPDATE enterprise SET ? WHERE id = ?;';
  const data = db.convert(req.body, ['location_uuid']);

  const { settings } = data;
  delete data.settings;

  data.id = req.params.id;

  db.exec(sql, [data, data.id])
    .then((row) => {
      if (!row.affectedRows) {
        throw new NotFound(`Could not find an enterprise with id ${req.params.id}`);
      }

      return db.exec('UPDATE enterprise_setting SET ? WHERE enterprise_id = ?', [settings, req.params.id]);
    })
    .then(() => lookupEnterprise(req.params.id))
    .then((enterprise) => {
      res.status(200).json(enterprise);
    })
    .catch(next)
    .done();
};

// POST /enterprises/:id/logo
exports.uploadLogo = (req, res, next) => {
  if (req.files.length === 0) {
    next(BadRequest('Expected at least one file upload but did not receive any files.'));
    return;
  }

  const logo = req.files[0].link;
  const sql = 'UPDATE enterprise SET logo = ? WHERE id = ?';

  db.exec(sql, [logo, req.params.id])
    .then(() => {
      res.status(200).json({ logo });
    })
    .catch(next)
    .done();
};
