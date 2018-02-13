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

const q = require('q');
const _ = require('lodash');
const db = require('../../lib/db');
const Transaction = require('../../lib/db/transaction');
const NotFound = require('../../lib/errors/NotFound');

const debug = require('debug')('FiscalYear');

// Account Service
const AccountService = require('./accounts');

exports.list = list;
exports.getFiscalYearsByDate = getFiscalYearsByDate;
exports.setOpeningBalance = setOpeningBalance;
exports.getBalance = getBalance;
exports.closing = closing;
exports.create = create;
exports.detail = detail;
exports.update = update;
exports.remove = remove;
exports.getPeriodByFiscal = getPeriodByFiscal;
exports.lookupFiscalYearByDate = lookupFiscalYearByDate;
exports.getFirstDateOfFirstFiscalYear = getFirstDateOfFirstFiscalYear;
exports.getNumberOfFiscalYears = getNumberOfFiscalYears;
exports.getDateRangeFromPeriods = getDateRangeFromPeriods;
exports.getPeriodIdsFromDateRange = getPeriodIdsFromDateRange;
exports.accountBanlanceByTypeId = accountBanlanceByTypeId;
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
  const sql = `
    SELECT id, enterprise_id, number_of_months, label, start_date, end_date,
    previous_fiscal_year_id, locked, note
    FROM fiscal_year
    WHERE id = ?;
  `;

  return db.one(sql, [id], id, 'fiscal year');
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
    .then((rows) => {
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
  const sql = `
    SELECT p.fiscal_year_id, f.previous_fiscal_year_id, f.start_date, f.end_date, f.label,
      DATEDIFF(DATE(?), f.start_date) / (f.number_of_months * 30.5) AS percentage,
      DATE_ADD(f.start_date, INTERVAL number_of_months MONTH) AS end_date
    FROM period AS p
    JOIN fiscal_year AS f ON f.id = p.fiscal_year_id
    WHERE p.start_date <= DATE(?) AND DATE(?) <= p.end_date;
  `;

  db.exec(sql, [date, date, date])
    .then((rows) => {
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

  const params = [
    record.enterprise_id, record.previous_fiscal_year_id, record.user_id,
    record.label, record.number_of_months,
    record.start_date, record.end_date, record.note,
  ];

  const transaction = db.transaction();

  transaction
    .addQuery('SET @fiscalYearId = 0;')
    .addQuery('CALL CreateFiscalYear(?, ?, ?, ?, ?, ?, ?, ?, @fiscalYearId);', params)
    .addQuery('SELECT @fiscalYearId AS fiscalYearId;')
    .execute()
    .then((results) => {
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
  const { id } = req.params;

  debug(`#detail() looking up FY${id}.`);

  lookupFiscalYear(id)
    .then((record) => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

/**
 * Updates a fiscal year details (particularly id)
 */
function update(req, res, next) {
  const { id } = req.params;
  const sql = 'UPDATE fiscal_year SET ? WHERE id = ?';
  const queryData = req.body;

  if (queryData.start_date && queryData.end_date) {
    queryData.start_date = new Date(queryData.start_date);
    queryData.end_date = new Date(queryData.end_date);
  }

  // remove the id before updating (if the ID exists)
  delete queryData.id;

  debug(`#update() updating column ${Object.keys(queryData)} on FY${id}.`);

  lookupFiscalYear(id)
    .then(() => db.exec(sql, [queryData, id]))
    .then(() => lookupFiscalYear(id))
    .then(fiscalYear => res.status(200).json(fiscalYear))
    .catch(next)
    .done();
}

/**
 * Remove a fiscal year details (particularly id)
 */
function remove(req, res, next) {
  const { id } = req.params;
  const sqlDelFiscalYear = 'DELETE FROM fiscal_year WHERE id = ?;';
  const sqlDelPeriods = 'DELETE FROM period WHERE fiscal_year_id = ?;';

  const transaction = new Transaction(db);

  debug(`#remove() deleting FY${id}.`);

  transaction
    .addQuery(sqlDelPeriods, [id])
    .addQuery(sqlDelFiscalYear, [id])
    .execute()
    .then((results) => {
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
  const { id } = req.params;
  const period = req.params.period_number;

  debug(`#getBalance() looking up balance for FY${id} and period ${period}.`);

  lookupBalance(id, period)
    .then((rows) => {
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
  const glb = {};

  const sql = `
    SELECT t.period_id, a.id, a.label,
      SUM(t.debit) AS debit, SUM(t.credit) AS credit, SUM(t.debit - t.credit) AS balance
    FROM period_total t
    JOIN account a ON a.id = t.account_id
    JOIN period p ON p.id = t.period_id
    WHERE t.fiscal_year_id = ? AND p.number <= ?
    GROUP BY a.id HAVING balance <> 0;
  `;

  const periodSql = `
    SELECT id FROM period
    WHERE fiscal_year_id = ? AND number = ?;
  `;

  return db.exec(periodSql, [fiscalYearId, periodNumber])
    .then((rows) => {
      if (!rows.length) {
        throw new NotFound(`Could not find the period ${periodNumber} for the fiscal year with id ${fiscalYearId}.`);
      }
      [glb.period] = rows;
      return db.exec(sql, [fiscalYearId, periodNumber]);
    })
    .then((rows) => {
      glb.existTotalAccount = rows;

      // for to have an updated data in any time
      return AccountService.lookupAccount();
    })
    .then((rows) => {
      let inlineAccount;
      const allAccounts = rows;

      glb.totalAccount = allAccounts.map((item) => {
        inlineAccount = _.find(glb.existTotalAccount, { id : item.id });

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
  const {
    id,
  } = req.params;

  const { accounts } = req.body.params;
  const fiscalYear = req.body.params.fiscal;

  debug(`#setOpeningBalance() setting balance for FY${id}.`);

  // check for previous fiscal year
  hasPreviousFiscalYear(id)
    .then((hasPrevious) => {
      let promise;

      if (hasPrevious) {
        // load from the period N+1 of the year N-1 into period 0 of the year N
        promise = loadOpeningBalance(fiscalYear);
      } else {
        // set new opening balance
        promise = newOpeningBalance(fiscalYear, accounts);
      }

      return promise;
    })
    .then(() => res.sendStatus(201))
    .catch(next)
    .done();
}

/**
 * @function hasPreviousFiscalYear
 * @description check if the fiscal year given has a previous one or more
 * @param {number} id current fiscal year id
 */
function hasPreviousFiscalYear(id) {
  let sql = 'SELECT previous_fiscal_year_id FROM fiscal_year WHERE id = ?;';

  return db.one(sql, [id], id, 'fiscal year')
    .then((row) => {
      sql = 'SELECT id FROM fiscal_year WHERE id = ?;';
      return db.exec(sql, [row.previous_fiscal_year_id]);
    })
    .then((rows) => {
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
    .then(accounts => insertOpeningBalance(fiscalYear, accounts));
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
    .then((rows) => {
      if (!rows.length) {
        const msg = `Could not find the period with fiscal year id ${fiscalYear.id} and period number 0.`;
        throw new NotFound(msg);
      }

      const periodZeroId = rows[0].id;
      const periodTotalData = notNullBalance(accounts, true)
        .map(item => formatPeriodTotal(item, fiscalYear, periodZeroId));

      const sql = `
        INSERT INTO period_total
        (enterprise_id, fiscal_year_id, period_id, account_id, credit, debit)
        VALUES
        (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE credit = VALUES(credit), debit = VALUES(debit);
      `;
      const dbPromise = periodTotalData.map(item =>
        db.exec(sql, [
          item.enterprise_id, item.fiscal_year_id, item.period_id,
          item.account_id, item.credit, item.debit,
        ]));
      return q.all(dbPromise);
    });
}

/**
 * @function lookupPeriod
 */
function lookupPeriod(fiscalYearId, periodNumber) {
  const sql = 'SELECT id FROM period WHERE fiscal_year_id = ? AND number = ?;';
  return db.exec(sql, [fiscalYearId, periodNumber]);
}

/**
 * @function formatPeriodTotal
 */
function formatPeriodTotal(account, fiscalYear, periodId) {
  return {
    enterprise_id  : fiscalYear.enterprise_id,
    fiscal_year_id : fiscalYear.id,
    period_id      : periodId,
    account_id     : account.id,
    credit         : account.credit,
    debit          : account.debit,
  };
}

/**
 * @function notNullBalance
 * @description return an array with not null values for debit or credit
 * @param {array} array An array of ojects with credit and debit property
 * @return {array} array
 */
function notNullBalance(array, exception) {
  return exception ? array : array.filter(item => (item.debit !== 0 || item.credit !== 0));
}

/**
 * @function closing
 * @description closing a fiscal year
 *
 * @todo - migrate this to a stored procedure
 */
function closing(req, res, next) {
  const { id } = req.params;
  const accountId = req.body.params.account_id;

  const transaction = db.transaction();

  transaction
    .addQuery('CALL CloseFiscalYear(?, ?)', [id, accountId]);

  transaction.execute()
    .then(() => {
      res.status(200).json({ id : parseInt(id, 10) });
    })
    .catch(next)
    .done();
}

/**
 * @method getPeriodByFiscal
 *
 * @description
 * This function returns all Fiscal Year's periods
 * the Fiscal Year provided.  If no record is found, it throws a NotFound error.
 *
 * @param {fiscalYearId}  - Makes it possible to select the different periods of the fiscal year
 * @returns {Promise} - a promise resolving to the periods record
 *
 */
function getPeriodByFiscal(fiscalYearId) {
  const sql = `
    SELECT period.number, period.id
    FROM period
    JOIN fiscal_year ON period.fiscal_year_id = fiscal_year.id
    WHERE period.fiscal_year_id = ? AND period.number <> 13;
  `;

  return db.exec(sql, [fiscalYearId]);
}

/**
 * @method lookupFiscalYearByDate
 *
 * @description
 * This function returns a single record from the fiscal year table matching
 *
 */
function lookupFiscalYearByDate(transDate) {
  const sql = `
    SELECT p.fiscal_year_id, p.id, f.locked, f.note, f.label
    FROM period AS p
    JOIN fiscal_year AS f ON f.id = p.fiscal_year_id
    WHERE DATE(p.start_date) <= DATE(?) AND DATE(p.end_date) >= DATE(?);
  `;

  return db.one(sql, [transDate, transDate], transDate, 'fiscal year');
}

/**
 * @function getFirstDateOfFirstFiscalYear
 *
 * @description
 * returns the start date of the very first fiscal year for the provided
 * enterprise.
 *
 * @TODO - move this to the fiscal controller with other AccountExtra functions.
 */
function getFirstDateOfFirstFiscalYear(enterpriseId) {
  const sql = `
    SELECT start_date FROM fiscal_year
    WHERE enterprise_id = ?
    ORDER BY DATE(start_date)
    LIMIT 1;
  `;

  return db.one(sql, enterpriseId);
}

/**
 * @method getNumberOfFiscalYears
 *
 * @description
 * This function returns the number of fiscal years between two dates.
 *
 * FIXME(@jniles) - should this not include the enterprise id?
 */
function getNumberOfFiscalYears(dateFrom, dateTo) {
  const sql = `
    SELECT COUNT(id) AS fiscalYearSpan FROM fiscal_year
    WHERE
    start_date >= DATE(?) AND end_date <= DATE(?)
  `;

  return db.one(sql, [dateFrom, dateTo]);
}

function getPeriodIdsFromDateRange(startDate, endDate) {
  const sql = `SELECT id FROM period WHERE start_date>= ? AND end_date<= ?`;
  return db.one(sql, [startDate, endDate]);
}

function getDateRangeFromPeriods(periods) {
  const sql = `
    SELECT
      MIN(start_date) AS dateFrom, MAX(end_date) AS dateTo
    FROM
      period
    WHERE
      period.id IN (?, ?)`;

  return db.one(sql, [periods.periodFrom, periods.periodTo]);
}

/**
 * return a query for retrieving account'balance by type_id and periods
 */
function accountBanlanceByTypeId() {
  return `
    SELECT ac.id, ac.number, ac.label, ac.parent, IFNULL(s.amount, 0) AS amount, s.type_id

    FROM account as ac LEFT JOIN (
    SELECT SUM(pt.credit - pt.debit) as amount, pt.account_id, act.id as type_id
    FROM period_total as pt
    JOIN account as a ON a.id = pt.account_id
    JOIN account_type as act ON act.id = a.type_id
    JOIN period as p ON  p.id = pt.period_id
    JOIN fiscal_year as fy ON fy.id = p.fiscal_year_id
    WHERE fy.id = ? AND
      pt.period_id IN (
        SELECT id FROM period WHERE start_date>= ? AND end_date<= ?
      )
      AND act.id = ?
    GROUP BY pt.account_id
    )s ON ac.id = s.account_id
    ORDER BY ac.number
  `;
}
