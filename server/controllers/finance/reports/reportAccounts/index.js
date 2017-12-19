const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');

const Accounts = require('../../accounts');
const AccountsExtra = require('../../accounts/extra');
const Fiscal = require('../../fiscal');
const FilterParser = require('../../../../lib/filter');

const TEMPLATE = './server/controllers/finance/reports/reportAccounts/report.handlebars';

exports.getAccountTransactions = getAccountTransactions;

/**
 * @method document
 *
 * @description
 * Renders the PDF template with all the
 */
function document(req, res, next) {
  let report;
  const bundle = {};

  const params = req.query;
  params.user = req.session.user;
  params.enterprise_id = req.session.enterprise.id;

  // flag to tell whether we will render the currency values as passed or not
  bundle.useOriginalTransactionCurrency =
    params.useOriginalTransactionCurrency === 'true';

  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    return next(e);
  }

  params.dateFrom = (params.dateFrom) ? new Date(params.dateFrom) : new Date();

  return AccountsExtra.getOpeningBalanceForDate(params.account_id, params.dateFrom, false)
    .then(balance => {
      const openingBalance = {
        date            : params.dateFrom,
        balance         : Number(balance.balance),
        credit          : Number(balance.credit),
        debit           : Number(balance.debit),
        isCreditBalance : Number(balance.balance) < 0,
      };

      _.extend(bundle, { openingBalance });
      return getAccountTransactions(params, openingBalance.balance);
    })
    .then((result) => {
      _.extend(bundle, {
        accountDetails : result.accountDetails,
        transactions : result.transactions,
        sum : result.sum,
        params,
      });

      // temp binding to make the period object easier to read
      const o = bundle.openingBalance;
      const totals = bundle.sum.footer;

      // contains the period totals (opening balance + grid footer)
      const period = {
        debit : totals.debit + o.debit,
        credit : totals.credit + o.credit,
        balance : totals.balance + o.balance,
        exchangedDebit : (totals.debit + o.debit) * totals.rate,
        exchangedCredit : (totals.credit + o.credit) * totals.rate,
        exchangedBalance : (totals.balance + o.balance) * totals.rate,
        exchangedDate : new Date(),
        currency_id : totals.currency_id,
        inverted_rate : totals.inverted_rate,
      };

      period.showExchangeRate = (period.inverted_rate !== 1);

      _.merge(bundle.sum, { period });

      return Fiscal.getNumberOfFiscalYears(params.dateFrom, params.dateTo);
    })
    .then((result) => {
      // check to see if this statement spans multiple fiscal years AND concerns
      // an income/ expense account
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

/**
 * @function getGeneralLedgerSQL
 *
 * @description
 * Used by the getAccountTransaction() function internally.  The internal SQL
 * just pulls out the values tied to a particular account.
 */
function getGeneralLedgerSQL(options) {
  const filters = new FilterParser(options);

  const sql = `
    SELECT trans_id, description, trans_date, document_reference, debit_equiv, credit_equiv,
      debit, credit, @cumsum := balance + @cumsum AS cumsum,
      currency_id FROM (
      SELECT trans_id, description, trans_date, document_map.text AS document_reference,
        SUM(debit_equiv) as debit_equiv, SUM(credit_equiv) AS credit_equiv,
        (SUM(debit_equiv) - SUM(credit_equiv)) AS balance, SUM(debit) AS debit,
        SUM(credit) AS credit, MAX(currency_id) AS currency_id
      FROM general_ledger
      LEFT JOIN document_map ON record_uuid = document_map.uuid
  `;

  filters.equals('account_id');
  filters.dateFrom('dateFrom', 'trans_date');
  filters.dateTo('dateTo', 'trans_date');
  filters.period('period', 'date');

  filters.setGroup('GROUP BY record_uuid');
  filters.setOrder('ORDER BY trans_date ASC');

  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();

  return { query, parameters };
}

// @TODO define standards for displaying and rounding totals, unless numbers are rounded
//       uniformly they may be displayed differently from what is recorded
function getTotalsSQL(options) {
  const currencyId = options.currency_id || options.enterprise_currency_id;

  const sqlTotals = `
    SELECT
      IFNULL(getExchangeRate(${options.enterprise_id}, ${currencyId}, NOW()), 1) AS rate,
      ${currencyId} AS currency_id,
      SUM(ROUND(debit_equiv, 2)) AS debit, SUM(ROUND(credit_equiv, 2)) AS credit,
      (SUM(ROUND(debit_equiv, 2)) - SUM(ROUND(credit_equiv, 2))) AS balance
    FROM general_ledger
  `;

  const filters = new FilterParser(options);

  filters.equals('account_id');
  filters.dateFrom('dateFrom', 'trans_date');
  filters.dateTo('dateTo', 'trans_date');
  filters.period('period', 'date');

  const totalsQuery = filters.applyQuery(sqlTotals);
  const totalsParameters = filters.parameters();

  return { totalsQuery, totalsParameters };
}


/**
 * @function getAccountTransactions
 *
 * @description
 * This function returns all the transactions for an account,
 */
function getAccountTransactions(options, openingBalance = 0) {
  const { query, parameters } = getGeneralLedgerSQL(options);

  // the running balance can only be in the enterprise currency.  It doesn't
  // make sense to have the running balance in any other currency.
  const sql = `
    SELECT groups.trans_id, groups.debit, groups.credit, groups.debit_equiv,
      groups.credit_equiv, groups.trans_date, groups.document_reference,
      ROUND(1 / IFNULL(GetExchangeRate(${options.enterprise_id}, groups.currency_id, groups.trans_date), 0), 2) AS rate,
      groups.cumsum, groups.description, groups.currency_id
    FROM (${query})c, (SELECT @cumsum := ${openingBalance || 0})z) AS groups
  `;

  const { totalsQuery, totalsParameters } = getTotalsSQL(options);

  const bundle = {};

  return Accounts.lookupAccount(options.account_id)
    .then(accountDetails => {
      _.extend(bundle, { accountDetails });

      return db.exec(sql, parameters);
    })
    .then(transactions => {
      _.extend(bundle, { transactions });
      // get the balance at the final date
      return AccountsExtra.getOpeningBalanceForDate(options.account_id, options.dateTo, true);
    })
    .then((sum) => {
      // if the sum come back as zero (because there were no lines), set the default sum to the
      // opening balance
      sum.credit_equiv = sum.credit_equiv || 0;
      sum.debit_equiv = sum.debit_equiv || 0;
      sum.balance = sum.balance || 0;
      sum.isCreditBalance = sum.balance < 0;

      _.extend(bundle, { sum });
      // get totals for this period
      return db.one(totalsQuery, totalsParameters);
    })
    .then(totals => {
      // contains the grid totals for the footer
      const footer = {
        date : options.dateTo,
        debit : totals.debit,
        credit : totals.credit,
        balance : totals.balance,
        exchangedDebit : totals.debit * totals.rate,
        exchangedCredit : totals.credit * totals.rate,
        exchangedBalance : totals.balance * totals.rate,
        currency_id : totals.currency_id,
        exchangedDate : new Date(),
        rate : totals.rate,
        inverted_rate : Math.round(1 / totals.rate),
      };

      _.merge(bundle.sum, { footer });

      return bundle;
    });
}

exports.document = document;
