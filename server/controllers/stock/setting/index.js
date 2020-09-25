/**
 * The Stock Settings Controller
 *
 * This controller is responsible for creating and updating stock-related settings.
 */

const _ = require('lodash');

const db = require('../../../lib/db');
const NotFound = require('../../../lib/errors/NotFound');
const BadRequest = require('../../../lib/errors/BadRequest');

// GET /stock/setting
//
// Get the current stock settings for the Enterprise
//    If req.query.enterprise_id is set, it will use that,
//    otherwise it will look up the entry for Enterprise.id=1
exports.list = function list(req, res, next) {
  const enterpriseId = req.query.enterprise_id || '1';
  let sql = `
    SELECT month_average_consumption, default_min_months_security_stock,
      enable_auto_purchase_order_confirmation, enable_auto_stock_accounting,
      enable_daily_consumption, enable_strict_depot_permission,
      enable_supplier_credit
    FROM stock_setting LEFT JOIN enterprise
    ON enterprise.id = enterprise_id
    `;
  sql += ' WHERE enterprise_id = ' + enterpriseId + ' LIMIT 1;'

  db.exec(sql)
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
};


// // GET /stock/setting/:id
// exports.detail = function detail(req, res, next) {
//   lookupEnterprise(req.params.id)
//     .then(enterprise => {
//       res.status(200).json(enterprise);
//     })
//     .catch(next)
//     .done();
// };


// POST /stock/setting
exports.create = function create(req, res, next) {
  const settings = req.body;
  const sql = 'INSERT INTO stock_setting SET ?;';
  db.exec(sql, [settings])
    .then(row => {
      res.status(201).json({ enterprise_id : row.insertId });
    })
    .catch(next)
    .done();
};

// PUT /stock/setting/:id
//
//  Update the settings in stock_settings for the settings
//  with enterprise_id given by the 'id' parameter
exports.update = function update(req, res, next) {
  const sql = 'UPDATE stock_setting SET ? WHERE enterprise_id = ?';
  const { settings } = req.body;

  db.exec(sql, [settings, req.params.id])
    .then((row) => {
      if (!row.affectedRows) {
        throw new NotFound(`Could not find a stock_setting with enterprise id ${req.params.id}`);
      }
      // Get the updated values
      return db.exec('UPDATE stock_setting SET ? WHERE enterprise_id = ?', [settings, req.params.id]);
    })
    .then((updatedSettings) => {
      res.status(200).json(updatedSettings);
    })
    .catch(next)
    .done();
};