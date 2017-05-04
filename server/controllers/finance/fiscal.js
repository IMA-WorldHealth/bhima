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
const BadRequest = require('../../lib/errors/BadRequest');

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
      res.status(201).json({ id: results[2][0].fiscalYearId });
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
  const id = req.params.id;

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
  const id = req.params.id;
  const sqlDelFiscalYear = 'DELETE FROM fiscal_year WHERE id = ?;';
  const sqlDelPeriods = 'DELETE FROM period WHERE fiscal_year_id = ?;';

  const transaction = new Transaction(db);

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
  const id = req.params.id;
  const period = req.params.period_number;

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
  .then((rows) => {
    if (!rows.length) {
      throw new NotFound(`Could not find the period ${periodNumber} for the fiscal year with id ${fiscalYearId}.`);
    }
    glb.period = rows[0];
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
  const accounts = req.body.params.accounts;

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
      const periodTotalData = notNullBalance(accounts)
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
        ])
      );
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
function notNullBalance(array) {
  return array.filter(item => (item.debit !== 0 || item.credit !== 0));
}

const sumCreditsMinusDebits = (aggregate, record) =>
  aggregate + (record.credit - record.debit);

const sumDebitsMinusCredits = (aggregate, record) =>
  aggregate + (record.debit - record.credit);

/**
 * @function closing
 * @description closing a fiscal year
 *
 * @todo - migrate this to a stored procedure
 */
function closing(req, res, next) {
  const id = req.params.id;
  const accountId = req.body.params.account_id;
  const exploitation = {};
  const result = {};
  let fiscal;
  let period;
  let sql;
  
  // query fiscal year
  sql = 'SELECT id, number_of_months, end_date FROM fiscal_year WHERE id = ?;';

  db.one(sql, [id], id, 'fiscal year')
    .then((row) => {
      fiscal = row;

      // query period
      sql = 'SELECT p.id FROM period p WHERE p.fiscal_year_id = ? AND p.number = ?;';
      return db.exec(sql, [id, fiscal.number_of_months]);
    })
    .then((rows) => {
      if (!rows) {
        throw new NotFound(
          `Could not find the period for the fiscal year with id ${id} and number ${fiscal.number_of_months}.`
        );
      }
      period = rows[0];
    })
    .then(() => {
      const sqlProfitAccounts = `
        SELECT a.id, pt.credit, pt.debit
        FROM period_total AS pt
        JOIN account AS a ON pt.account_id = a.id
        JOIN account_type AS at ON a.type_id = at.id
        WHERE (pt.fiscal_year_id = ? AND pt.period_id = ?) AND at.type = 'income';
      `;

      const sqlChargeAccounts = `
        SELECT a.id, pt.credit, pt.debit
        FROM period_total AS pt
        JOIN account AS a ON pt.account_id = a.id
        JOIN account_type AS at ON a.type_id = at.id
        WHERE (pt.fiscal_year_id = ? AND pt.period_id = ?) AND at.type = 'expense';
      `;

      return q.all([
        db.exec(sqlProfitAccounts, [id, period.id]),
        db.exec(sqlChargeAccounts, [id, period.id]),
      ]);
    })
    .spread((profitAccounts, chargeAccounts) => {
      exploitation.profit = notNullBalance(profitAccounts);
      exploitation.charge = notNullBalance(chargeAccounts);

      // profit
      result.profit = exploitation.profit.reduce(sumCreditsMinusDebits, 0);

      // charge
      result.charge = exploitation.charge.reduce(sumDebitsMinusCredits, 0);

      // result
      result.global = result.profit - result.charge;
    })
    .then(() => {
      const sqlInsertJournal = `
        INSERT INTO posting_journal (uuid, project_id, fiscal_year_id, period_id,
          trans_id, trans_date, record_uuid, description, account_id, debit,
          credit, debit_equiv, credit_equiv, currency_id, entity_uuid,
          reference_uuid, comment, origin_id, user_id, cc_id, pc_id)
        SELECT
          HUID(UUID()), ?, ?, ?, @transId, ?,
          HUID(UUID()), ?, ?, ?, ?, ?, ?, ?,
          NULL, NULL, NULL, NULL, ?, NULL, NULL
      `;

      // util variables
      const projectId = req.session.project.id;
      const currencyId = req.session.enterprise.currency_id;
      const userId = req.session.user.id;
      const transaction = db.transaction();

      // generate the transaction id
      const sqlTransId = 'SET @transId = GenerateTransactionId(?);';
      transaction.addQuery(sqlTransId, projectId);

      // sold the profit exploitation
      exploitation.profit.forEach((item) => {
        // profit has creditor sold
        const value = item.credit - item.debit;

        // inverted values for solding
        const debit = value >= 0 ? Math.abs(value) : 0;
        const credit = value >= 0 ? 0 : Math.abs(value);

        const profitParams = [
          projectId,                      // project_id
          fiscal.id,                      // fiscal_year_id
          fiscal.number_of_months + 1,    // period_id
          fiscal.end_date,                // date : the last date of the fiscal year
          'Ecriture de solde des profits pour la cloture',
          item.id,                        // account_id
          debit, credit,                  // debit and credit
          debit, credit,                  // debit_equiv and credit_equiv in enterprise currency
          currencyId,                     // enterprise currency because data came from period total
          userId,                          // user id
        ];

        transaction.addQuery(sqlInsertJournal, profitParams);
      });

      // sold the charge exploitation
      exploitation.charge.forEach((item) => {
        // charge has debtor sold
        const value = item.debit - item.credit;

        // inverted values for solding
        const debit = value > 0 ? 0 : Math.abs(value);
        const credit = value > 0 ? Math.abs(value) : 0;

        const chargeParams = [
          projectId,                      // project_id
          fiscal.id,                      // fiscal_year_id
          fiscal.number_of_months + 1,    // period_id
          fiscal.end_date,                // date : the last date of the fiscal year
          'Ecriture de solde des charges pour la cloture',
          item.id,                        // account_id
          debit, credit,                  // debit and credit
          debit, credit,                  // debit_equiv and credit_equiv in enterprise currency
          currencyId,                     // enterprise currency because data came from period total
          userId,                         // user id
        ];

        transaction.addQuery(sqlInsertJournal, chargeParams);
      });

      // be sure to have accounts to sold, either profit or charge
      if (exploitation.profit.length || exploitation.charge.length) {
        // the result: profit - charge
        const value = result.global;

        // debit if benefits or credit if loss
        const debit = value >= 0 ? 0 : Math.abs(value);
        const credit = value >= 0 ? Math.abs(value) : 0;

        const resultParams = [
          projectId,                      // project_id
          fiscal.id,                      // fiscal_year_id
          fiscal.number_of_months + 1,    // period_id
          fiscal.end_date,                // date : the last date of the fiscal year
          'Ecriture du result lors de la cloture',
          accountId,
          debit, credit,                  // debit and credit
          debit, credit,                  // debit_equiv and credit_equiv in enterprise currency
          currencyId,                     // enterprise currency because data came from period total
          userId,                         // user id
        ];

        transaction.addQuery(sqlInsertJournal, resultParams);
      }

      // lock the fiscal year
      transaction.addQuery('UPDATE fiscal_year SET locked = 1 WHERE id = ?;', [id]);

      return transaction.execute();
    })
    .then((rows) => {
      const queryUpdateFiscal = rows.pop();
      if (!queryUpdateFiscal.changedRows) {
        throw new BadRequest('FISCAL.FAILURE_CLOSING', 'Failure occurs during the closing of the fiscal year');
      }
      res.status(200).json({ id });
    })
    .catch(next)
    .done();
}
