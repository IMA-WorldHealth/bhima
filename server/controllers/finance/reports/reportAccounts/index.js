const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');

const Accounts = require('../../accounts');

// TODO(@jniles) - merge this into the regular accounts controller
const AccountsExtra = require('../../accounts/extra');

const TEMPLATE = './server/controllers/finance/reports/reportAccounts/report.handlebars';
const BadRequest = require('../../../../lib/errors/BadRequest');

/**
 * Expose to controllers
 */
exports.getAccountTransactions = getAccountTransactions;

/**
 * @method document
 *
 * @description
 * generate Report of accounts as a document
 */
function document(req, res, next) {
  let report;
  const bundle = {};

  const params = req.query;

  if (!params.account_id) {
    throw new BadRequest('Account ID missing', 'ERRORS.BAD_REQUEST');
  }

  if (!params.dateFrom || !params.dateTo) {
    throw new BadRequest('Report must specify date boundaries', 'ERRORS.BAD_REQUEST');
  }

  params.user = req.session.user;

  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    return next(e);
  }

  const dateFrom = (params.dateFrom) ? new Date(params.dateFrom) : new Date();

  return AccountsExtra.getOpeningBalanceForDate(params.account_id, dateFrom)
    .then((balance) => {
      const openingBalance = {
        date            : dateFrom,
        balance         : balance.balance,
        credit          : balance.credit,
        debit           : balance.debit,
        isCreditBalance : balance.balance < 0,
      };

      _.extend(bundle, { openingBalance });
      return getAccountTransactions(params.account_id, params.dateFrom, params.dateTo, balance.balance);
    })
    .then((result) => {
      _.extend(bundle, {
        accountDetails : result.accountDetails,
        transactions : result.transactions,
        sum : result.sum,
        params });

      return getNumberOfFiscalYears(params.dateFrom, params.dateTo);
    })
    .then((result) => {
      // check to see if this statement spans multiple fiscal years AND concerns an income/ expense account
      // @TODO these constants should be system shared variables
      const incomeAccountId = 4;
      const expenseAccountId = 5;

      const multipleFiscalYears = result.fiscalYearSpan > 1;
      const incomeExpenseAccount = (bundle.accountDetails.type_id === incomeAccountId) ||
      (bundle.accountDetails.type_id === expenseAccountId);

      if (multipleFiscalYears && incomeExpenseAccount) {
        _.extend(bundle, {
          warnMultipleFiscalYears : true,
        });
      }
      return report.render(bundle);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

function getNumberOfFiscalYears(dateFrom, dateTo) {
  const sql = `
    SELECT COUNT(id) as fiscalYearSpan from fiscal_year
    WHERE
    start_date >= DATE(?) AND end_date <= DATE(?)
  `;

  return db.one(sql, [dateFrom, dateTo]);
}

/**
 * @function getAccountTransactions
 * This feature select all transactions for a specific account
*/
function getAccountTransactions(accountId, dateFrom, dateTo, openingBalance) {
  const params = [accountId];
  let dateCondition = '';

  if (dateFrom && dateTo) {
    dateCondition = 'AND DATE(trans_date) BETWEEN DATE(?) AND DATE(?)';
    params.push(new Date(dateFrom), new Date(dateTo));
  }

  const sql = `
    SELECT groups.trans_id, groups.debit, groups.credit, groups.trans_date,
      groups.document_reference, groups.cumsum, groups.description
    FROM (
      SELECT trans_id, description, trans_date, document_reference, debit, credit,
        @cumsum := balance + @cumsum AS cumsum FROM (
        SELECT trans_id, description, trans_date, document_map.text AS document_reference,
          SUM(debit_equiv) as debit, SUM(credit_equiv) as credit, (SUM(debit_equiv) - SUM(credit_equiv)) AS balance
        FROM general_ledger
        LEFT JOIN document_map ON record_uuid = document_map.uuid
        WHERE account_id = ? ${dateCondition}
        GROUP BY record_uuid
        ORDER BY trans_date ASC
      )c, (SELECT @cumsum := ${openingBalance || 0})z
    ) AS groups
  `;

  // @TODO define standards for displaying and rounding totals, unless numbers are rounded
  //       uniformly they may be displayed differently from what is recorded
  const sqlTotals = `
    SELECT 
      SUM(ROUND(debit_equiv, 2)) as debit, SUM(ROUND(credit_equiv, 2)) as credit,
      (SUM(ROUND(debit_equiv, 2)) - SUM(ROUND(credit_equiv, 2))) as balance
    FROM 
      general_ledger
    WHERE 
      account_id = ?
      ${dateCondition}
  `;

  const bundle = {};

  return Accounts.lookupAccount(accountId)
    .then((accountDetails) => {
      _.extend(bundle, { accountDetails });
      return db.exec(sql, params);
    })
    .then((transactions) => {
      _.extend(bundle, { transactions });

      // get the balance at the final date
      return AccountsExtra.getOpeningBalanceForDate(accountId, dateTo);
    })
    .then((sum) => {
      // if the sum come back as zero (because there were no lines), set the default sum to the
      // opening balance
      sum.credit = sum.credit || 0;
      sum.debit = sum.debit || 0;
      sum.balance = sum.balance || 0;
      sum.isCreditBalance = sum.balance < 0;

      _.extend(bundle, { sum });
      // get totals for this period
      return db.one(sqlTotals, [accountId, dateFrom, dateTo]);
    })
    .then((totals) => {
      const period = {};
      period.debit = totals.debit;
      period.credit = totals.credit;
      period.balance = totals.balance;

      _.merge(bundle.sum, { period });
      return bundle;
    });
}

exports.document = document;
