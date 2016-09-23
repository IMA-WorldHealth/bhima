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

const q  = require('q');
const db = require('../../lib/db');
const Transaction = require('../../lib/db/transaction');
const NotFound = require('../../lib/errors/NotFound');
const _ = require('lodash');

// accounts list
const AccountList = require('./accounts').lookupAccount();

exports.list = list;
exports.getFiscalYearsByDate = getFiscalYearsByDate;
exports.setOpeningBalance = setOpeningBalance;
exports.getBalance = getBalance;
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
    SELECT id, enterprise_id, number_of_months, label, start_date, end_date,
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
      SELECT f.id, f.enterprise_id, f.number_of_months, f.label, f.start_date, f.end_date,
      f.previous_fiscal_year_id, f.locked, f.created_at, f.updated_at, f.note,
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
  } else {
    sql += ' ORDER BY start_date DESC';
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
    SELECT p.fiscal_year_id, f.previous_fiscal_year_id, f.start_date, f.end_date, f.label,
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
  record.end_date = new Date(record.end_date);

  let params = [
    record.enterprise_id, record.previous_fiscal_year_id, record.user_id,
    record.label, record.number_of_months,
    record.start_date, record.end_date, record.note
  ];

  let transaction = new Transaction(db);

  transaction
    .addQuery('SET @fiscalYearId = 0;')
    .addQuery('CALL CreateFiscalYear(?, ?, ?, ?, ?, ?, ?, ?, @fiscalYearId);', params)
    .addQuery('SELECT @fiscalYearId AS fiscalYearId;')
    .execute()
    .then(results => {
      // results[2] : is an array from the query SELECT @fiscalYearId AS fiscalYearId;
      res.status(201).json({ id : results[2][0].fiscalYearId });
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

  if (queryData.start_date && queryData.end_date) {
    queryData.start_date = new Date(queryData.start_date);
    queryData.end_date = new Date(queryData.end_date);
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
  const sqlDelFiscalYear = 'DELETE FROM fiscal_year WHERE id = ?;';
  const sqlDelPeriods = 'DELETE FROM period WHERE fiscal_year_id = ?;';

  let transaction = new Transaction(db);

  transaction
    .addQuery(sqlDelPeriods, [id])
    .addQuery(sqlDelFiscalYear, [id])
    .execute()
    .then(results => {
      // results[0] is the result for the first query
      // results[1] is the result for the second query
      if (!results[1].affectedRows) {
        throw new NotFound(`Cannot find fiscal year with id: ${id}`);
      }
      res.sendStatus(204);
    })
    .catch(next)
    .done();
}

/**
 * Get /fiscal/:id/balance/:period
 * @param {number} id the fiscal year id
 * @param {number} period the period number [0,13]
 * The balance for a specified fiscal year and period with all accounts
 * the period must be given
 */
function getBalance(req, res, next) {
  const id = req.params.id;
  const period = req.params.period_number;

  lookupBalance(id, period)
  .then(rows => {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
 * @function lookupBalance
 * @param {number} fiscalYearId fiscal year id
 * @param {number} periodNumber the period number
 */
function lookupBalance(fiscalYearId, periodNumber) {
  let glb = {};

  const sql = `
    SELECT t.period_id, a.id, a.label, t.debit, t.credit
    FROM period_total t
    JOIN account a ON a.id = t.account_id
    JOIN period p ON p.id = t.period_id
    WHERE t.fiscal_year_id = ? AND p.number = ?;
  `;

  const periodSql = `
    SELECT id FROM period
    WHERE fiscal_year_id = ? AND number = ?;
  `;

  return db.exec(periodSql, [fiscalYearId, periodNumber])
  .then(rows => {
    if (!rows.length) {
      throw new NotFound(`Could not find the period ${periodNumber} for the fiscal year with id ${fiscalYearId}.`);
    }
    glb.period = rows[0];
    return db.exec(sql, [fiscalYearId, periodNumber]);
  })
  .then(rows => {
    glb.existTotalAccount = rows;

    return AccountList;
  })
  .then(rows => {
    let inlineAccount;

    glb.totalAccount = rows.map(item => {
      inlineAccount = _.find(glb.existTotalAccount, { id: item.id });

      if (inlineAccount) {
        item.period_id = inlineAccount.period_id;
        item.debit = inlineAccount.debit;
        item.credit = inlineAccount.credit;
      } else {
        item.period_id = glb.period.id;
        item.debit = 0;
        item.credit = 0;
      }

      return item;
    });

    return glb.totalAccount;
  });
}

/**
 * PUT /fiscal/:id/opening_balance
 * set the opening balance for a specified fiscal year
 */
function setOpeningBalance(req, res, next) {
  const id = req.params.id;
  const fiscalYear = req.body.params.fiscal;
  let accounts = req.body.params.accounts;

  // check for previous fiscal year
  hasPreviousFiscalYear(id)
  .then(hasPrevious => {

    if (hasPrevious) {
      // load from the period N+1 into period 0
      return loadOpeningBalance(fiscalYear);

    } else {
      // set new opening balance
      return newOpeningBalance(fiscalYear, accounts);

    }

  })
  .then(rows => res.status(201).send())
  .catch(next)
  .done();

}

/**
 * @function hasPreviousFiscalYear
 * @description check if the fiscal year given has a previous one or more
 * @param {number} id current fiscal year id
 */
function hasPreviousFiscalYear(id) {
  let sql = `SELECT previous_fiscal_year_id FROM fiscal_year WHERE id = ?;`;

  return db.exec(sql, [id])
  .then(rows => {
    if (!rows.length) {
      throw new NotFound(`Could not find the fiscal year with id ${id}.`);
    }

    sql = `SELECT id FROM fiscal_year WHERE id = ?;`;
    return db.exec(sql, [rows[0].previous_fiscal_year_id]);
  })
  .then(rows => {
    if (!rows.length) { return false; }
    return true;
  });
}

/**
 * @function load opening balance
 * @description load the opening balance from period N+1 into period 0
 */
function loadOpeningBalance(fiscalYear) {
  /*
   * fetch the period 13 balance and insert it into
   * the period zero of the new fiscal year
   */
  return lookupBalance(fiscalYear.previous_fiscal_year_id, fiscalYear.number_of_months + 1)
    .then(accounts => {
      return insertOpeningBalance(fiscalYear, accounts);
    });
}

/**
 * @function new opening balance
 * @description set a new opening balance
 */
function newOpeningBalance(fiscalYear, accounts) {
  /*
   * insert the balance given directly into
   * the period zero of the new fiscal year
   */
  return insertOpeningBalance(fiscalYear, accounts);
}

/**
 * @function insertOpeningBalance
 */
function insertOpeningBalance(fiscalYear, accounts) {

  return lookupPeriod(fiscalYear.id, 0)
    .then(rows => {
      if (!rows.length) {
        let msg = `Could not find the period with fiscal year id ${fiscalYear.id} and period number 0.`;
        throw new NotFound(msg);
      }

      let sql, sqlParams;
      let periodZeroId = rows[0].id;
      let periodTotalData = notNullBalance(accounts).map(item => {
        return formatPeriodTotal(item, fiscalYear, periodZeroId);
      });

      let dbPromise = periodTotalData.map(item => {
        sql = `
          INSERT INTO period_total
          (enterprise_id, fiscal_year_id, period_id, account_id, credit, debit)
          VALUES
          (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE credit = VALUES(credit), debit = VALUES(debit);
        `;
        sqlParams = [
          item.enterprise_id, item.fiscal_year_id, item.period_id,
          item.account_id, item.credit, item.debit
        ];
        return db.exec(sql, sqlParams);
      });
      return q.all(dbPromise);
    });

}

/**
 * @function lookupPeriod
 */
function lookupPeriod(fiscalYearId, periodNumber) {
  const sql = `SELECT id FROM period WHERE fiscal_year_id = ? AND number = ?;`;
  return db.exec(sql, [fiscalYearId, periodNumber]);
}

/**
 * @function formatPeriodTotal
 */
 function formatPeriodTotal(account, fiscalYear, periodId) {
   return {
     enterprise_id: fiscalYear.enterprise_id,
     fiscal_year_id: fiscalYear.id,
     period_id: periodId,
     account_id: account.id,
     credit: account.credit,
     debit: account.debit
   };
 }

/**
 * @function notNullBalance
 * @description return an array with not null values for debit or credit
 * @param {array} array An array of ojects with credit and debit property
 * @return {array} array
 */
function notNullBalance(array) {
  return array.filter(item => {
    return (item.debit !== 0 || item.credit !== 0);
  });
}
