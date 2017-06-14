/**
 * @overview AccountExtras
 *
 * @description
 * Temporary file to avoid conflicts with changes in accounts/index.js.  This will be merged into accounts/index.js.
 * It should only be used in the account report.
 */

const db = require('../../../lib/db');

/**
 * @function getFiscalYearForDate
 * @private
 *
 * @description
 * Helper method to return the fiscal year associated with a provided date.
 *
 * @param {Date} date - the sought after JS date
 * @returns Promise - promise wrapping an integer fiscalYearId
 */
function getFiscalYearForDate(date) {
  const sql = `
    SELECT id FROM fiscal_year WHERE start_date <= DATE(?) AND end_date >= DATE(?);
  `;

  return db.one(sql, [date, date])
    .then(data => data.id);
}


/**
 * @function getPeriodForDate
 * @private
 *
 * @description
 * Helper method to return the period id associated with a given date.
 *
 * @param {Date} date - the sought after date
 * @returns Promise - promise wrapping an integer periodId
 */
function getPeriodForDate(date) {
  const sql = `
    SELECT id FROM period WHERE start_date <= DATE(?) AND end_date >= DATE(?);
  `;

  return db.one(sql, [date, date])
    .then(data => data.id);
}

/**
 * @function getPeriodAccountBalanceUntilDate
 * @private
 *
 * @description
 * Sums the balance of an account up to just before the given date's period.  For example, if the date was provided as
 * May 19, 2016, this function would return the account balance at the end of April 30, 2016.  This is useful for
 * computing opening balances of the period given a date.
 *
 * @param {Number} accountId - the account_id for the period_total table
 * @param {Date} date - the upper limit of the period
 * @param {Number} fiscalYearId - the fiscal_year_id for the period_total table
 *
 * @returns Promise - promise wrapping the balance object
 */
function getPeriodAccountBalanceUntilDate(accountId, date, fiscalYearId) {
  // - always factor in period 0 which does not have a valid end date entry
  // - period end date is strictly less than the current date as the transactions
  // for the current period will be added on top - if the last (end) date of a period
  // is selected transactions will be added on top and the current period will
  // be selected
  const periodCondition = `
    period.number = 0
    OR
    period.end_date < DATE(?)
  `;

  const sql = `
    SELECT SUM(debit - credit) AS balance
    FROM period_total JOIN period ON period.id = period_total.period_id
    WHERE period_total.account_id = ?
      AND ${periodCondition}
      AND period.fiscal_year_id = ?;
  `;

  return db.one(sql, [accountId, date, fiscalYearId])
    .then(data => data.balance);
}

/**
 * @function getComputedAccountBalanceUntilDate
 * @private
 *
 * @description
 * Sums general ledger lines hitting an account during a period, up to (and including) the provided date.
 */
function getComputedAccountBalanceUntilDate(accountId, date, periodId) {
  const sql = `
    SELECT SUM(debit_equiv - credit_equiv) AS balance FROM general_ledger
    WHERE account_id = ?
      AND trans_date <= DATE(?)
      AND period_id = ?;
  `;

  return db.one(sql, [accountId, date, periodId])
    .then(data => data.balance);
}


/**
 * @method getOpeningBalanceForDate
 * @public
 *
 * @description
 * Query the database for an account's balance as of a start date.  Note that the date should be escaped (via new
 * Date()) prior to calling this function
 *
 * @param {Number} accountId - the identifier for the account
 * @param {Date} date - the date that the opening balance should be computed through
 * @returns {Promise} - promise wrapping the balance of the account
 */
function getOpeningBalanceForDate(accountId, date) {
  let balance = 0;

  return getFiscalYearForDate(date)

    // 1. sum period totals up to the current required period
    .then(fiscalYearId =>
      getPeriodAccountBalanceUntilDate(accountId, date, fiscalYearId)
    )

    // 2. fetch the current dates period
    .then((previousPeriodClosingBalance) => {
      balance += previousPeriodClosingBalance;
      return getPeriodForDate(date);
    })

    // 3. calculate the sum of all general ledger transaction against this account
    //    for the current period up to the current date
    .then(periodId =>
      getComputedAccountBalanceUntilDate(accountId, date, periodId)
    )
    .then(runningPeriodBalance => (balance + runningPeriodBalance).toFixed(4));
}

exports.getOpeningBalanceForDate = getOpeningBalanceForDate;
