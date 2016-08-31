/**
 * @module controllers/finance/fiscal
 *
 * @description
 * This module is responsible for implementing CRUD on the fiscal table, as
 * well as accompanying period tables.
 *
 * @requires lib/db
 * @requires lib/errors/NotFound
 */

'use strict';

const db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');

exports.list = list;
exports.getFiscalYearsByDate = getFiscalYearsByDate;
exports.create = create;
exports.detail = detail;
exports.update = update;
exports.remove = remove;

/**
 * @method lookupFiscalYear
 *
 * @description
 * This function returns a single record from the fiscal year table matching
 * the ID provided.  If no record is found, it throws a NotFound error.
 *
 * @param {Number} id - the id of the sought fiscal year
 * @returns {Promise} - a promise resolving to the fiscal record
 *
 * @private
 */
function lookupFiscalYear(id) {
  const sql =`
    SELECT id, enterprise_id, number_of_months, label, start_date,
    previous_fiscal_year_id, locked, note
    FROM fiscal_year
    WHERE id = ?;
  `;

  return db.exec(sql, id)
    .then(function (rows) {

      if (!rows.length) {
        throw new NotFound(`Cannot find fiscal year with id: ${id}`);
      }

      return rows[0];
    });
}

/**
 * @method list
 *
 * @description
 * Returns a list of all fiscal year in the database.
 */
function list(req, res, next) {
  let sql = 'SELECT id, label FROM fiscal_year';
  const params = [];

  // make a complex query
  if (req.query.detailed === '1') {
    params.push(req.session.enterprise.id);

    sql = `
      SELECT f.id, f.enterprise_id, f.number_of_months, f.label, f.start_date,
      f.previous_fiscal_year_id, f.locked, f.created_at, f.updated_at, f.note, DATE_ADD(start_date, INTERVAL number_of_months MONTH) AS end_date,
      f.user_id, u.display_name
      FROM fiscal_year AS f
      JOIN user AS u ON u.id = f.user_id
      WHERE f.enterprise_id = ?
    `;
  }

  if (req.query.by && req.query.order) {
    const direction = (req.query.order === 'ASC') ? 'ASC' : 'DESC';
    params.push(req.query.by);
    sql += ` ORDER BY ?? ${direction} `;
  }

  db.exec(sql, params)
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
 * @method getFiscalYearByDate
 *
 * @description
 * Returns the fiscal year associated with a given date as well as useful
 * metadata, such as progress through the current fiscal year.
 */
function getFiscalYearsByDate(req, res, next) {
  const date = new Date(req.query.date);

  // select the fiscal year, the previous year, and the progress through the given year
  const sql =`
    SELECT p.fiscal_year_id, f.previous_fiscal_year_id, f.start_date, f.label,
      DATEDIFF(DATE(?), f.start_date) / (f.number_of_months * 30.5) AS percentage,
      DATE_ADD(f.start_date, INTERVAL number_of_months MONTH) AS end_date
    FROM period AS p
    JOIN fiscal_year AS f ON f.id = p.fiscal_year_id
    WHERE p.start_date <= DATE(?) AND DATE(?) <= p.end_date;
  `;

  db.exec(sql, [date, date, date])
    .then(function (rows) {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

// POST /fiscal
// creates a new fiscal year
function create(req, res, next) {
  const record = req.body;

  record.user_id = req.session.user.id;
  record.enterprise_id = req.session.enterprise.id;
  record.start_date = new Date(record.start_date);

  const sql = 'INSERT INTO fiscal_year SET ?;';

  db.exec(sql, [record])
    .then(function (result) {
      res.status(201).json({ id : result.insertId });
    })
    .catch(next)
    .done();
}

/**
 * GET /fiscal/:id
 *
 * Returns the detail of a single Fiscal Year
 */
function detail(req, res, next) {
  var id = req.params.id;

  lookupFiscalYear(id)
    .then(function (record) {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

/**
 * Updates a fiscal year details (particularly id)
 */
function update(req, res, next) {
  const id = req.params.id;
  const sql = 'UPDATE fiscal_year SET ? WHERE id = ?';
  const queryData = req.body;

  if (queryData.start_date) {
    queryData.start_date = new Date(queryData.start_date);
  }

  // remove the id before updating (if the ID exists)
  delete queryData.id;

  lookupFiscalYear(id)
    .then(function () {
      return db.exec(sql, [queryData, id]);
    })
    .then(function () {
      return lookupFiscalYear(id);
    })
    .then(function (fiscalYear) {
      res.status(200).json(fiscalYear);
    })
    .catch(next)
    .done();
}

/**
 * Remove a fiscal year details (particularly id)
 */
function remove(req, res, next) {
  const id = req.params.id;
  const sql = 'DELETE FROM fiscal_year WHERE id = ?;';

  db.exec(sql, [id])
    .then(function (results) {

      if (!results.affectedRows) {
        throw new NotFound(`Cannot find fiscal year with id: ${id}`);
      }

      res.sendStatus(204);
    })
    .catch(next)
    .done();
}
