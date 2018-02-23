const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');

const Accounts = require('../../accounts');
const AccountsExtra = require('../../accounts/extra');
const Exchange = require('../../exchange');
const Currency = require('../../currencies');
const Fiscal = require('../../fiscal');
const FilterParser = require('../../../../lib/filter');
const util = require('../../../../lib/util');

const TEMPLATE = './server/controllers/finance/reports/reportAccounts/report.handlebars';

/**
 * @method document
 *
 * @description
 * Renders the PDF template for the Account Statement Report.
 *
 * The report contains the following information:
 *  1. A header with the opening balance line.  This opening balance line is
 *  converted on the date of the `dateFrom` range.
 *  2. All general ledger transactions that
 *
 */
function document(req, res, next) {
  let report;
  const bundle = {};

  const params = req.query;
  params.user = req.session.user;
  params.enterprise_id = req.session.enterprise.id;
  params.isEnterpriseCurrency =
    (req.session.enterprise.currency_id === Number(params.currency_id));

  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    return next(e);
  }

  params.dateFrom = (params.dateFrom) ? new Date(params.dateFrom) : new Date();

  // first, we look up the currency to have all the parameters we need
  return Currency.lookupCurrencyById(params.currency_id)
    .then(currency => {
      _.extend(bundle, { currency });

      // get the exchange rate for the opening balance
      return Exchange.getExchangeRate(params.enterprise_id, params.currency_id, params.dateFrom);
    })
    .then(rate => {
      bundle.rate = rate.rate || 1;
      bundle.invertedRate = util.roundDecimal(1 / bundle.rate, 2);
      return AccountsExtra.getOpeningBalanceForDate(params.account_id, params.dateFrom, false);
    })
    .then(balance => {
      const { rate, invertedRate } = bundle;

      const header = {
        date            : params.dateFrom,
        balance         : Number(balance.balance),
        credit          : Number(balance.credit),
        debit           : Number(balance.debit),
        exchangedCredit : Number(balance.credit) * rate,
        exchangedDebit : Number(balance.debit) * rate,
        exchangedBalance : Number(balance.balance) * rate,
        isCreditBalance : Number(balance.balance) < 0,
        rate,
        invertedRate,
      };

      _.extend(bundle, { header });
      return getAccountTransactions(params, bundle.header.exchangedBalance);
    })
    .then(result => {
      _.extend(bundle, result, { params });
      return Fiscal.getNumberOfFiscalYears(params.dateFrom, params.dateTo);
    })
    .then((result) => {
      // check to see if this statement spans multiple fiscal years AND concerns
      // an income/ expense account
      // @TODO these constants should be system shared variables
      const incomeAccountId = 4;
      const expenseAccountId = 5;

      const multipleFiscalYears = result.fiscalYearSpan > 1;
      const incomeExpenseAccount = (bundle.account.type_id === incomeAccountId) ||
      (bundle.account.type_id === expenseAccountId);

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
 * Used by the getAccountTransactions() function internally.  The internal SQL
 * just pulls out the values tied to a particular account.
 *
 * The exchange rate logic is complicated.  Here is the basic idea:
 *  1. If you are in the enterprise currency, you want the calculation to
 *    use ${amount} / rate to calculate the values.
 *  2. If the you not in the enterprise currency, you want to use ${amount} * rate
 *    to convert "back" to the enterprise currency.
 *
 */
function getGeneralLedgerSQL(options) {
  const filters = new FilterParser(options);

  // return the proper way to convert the values depending on if we are in the
  // exchange rate currency or not.
  const enterpriseCurrencyColumns = `
    (debit / rate) AS exchangedDebit, (credit / rate) AS exchangedCredit,
    (balance / rate) AS exchangedBalance, @cumsum := (balance / rate) + @cumsum AS cumsum
  `;

  const nonEnterpriseCurrencyColumns = `
    (debit * rate) AS exchangedDebit, (credit * rate) AS exchangedCredit,
    (balance * rate) AS exchangedBalance, @cumsum := (balance * rate) + @cumsum AS cumsum
  `;

  const columns = options.isEnterpriseCurrency ?
    enterpriseCurrencyColumns : nonEnterpriseCurrencyColumns;


  const sql = `
    SELECT trans_id, description, trans_date, document_reference, debit, credit,
      debit_equiv, credit_equiv, currency_id, rate, (1 / rate) AS invertedRate,
      ${columns}
      FROM (
      SELECT trans_id, description, trans_date, document_map.text AS document_reference,
        IF(${options.isEnterpriseCurrency},
          IFNULL(GetExchangeRate(${options.enterprise_id}, currency_id, trans_date), 1),
          IF(${options.currency_id} = currency_id, 1,
            IFNULL(GetExchangeRate(${options.enterprise_id}, ${options.currency_id}, trans_date), 1)
        )) AS rate,
        SUM(debit_equiv) as debit_equiv, SUM(credit_equiv) AS credit_equiv,
        (SUM(debit) - SUM(credit)) AS balance, SUM(debit) AS debit,
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
      IFNULL(GetExchangeRate(${options.enterprise_id}, ${currencyId}, NOW()), 1) AS rate,
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
      groups.exchangedCredit, groups.exchangedDebit, groups.exchangedBalance,
      groups.rate, ROUND(groups.invertedRate, 2) AS invertedRate, groups.cumsum,
      groups.description, groups.currency_id
    FROM (${query})c, (SELECT @cumsum := ${openingBalance || 0})z) AS groups
  `;

  const { totalsQuery, totalsParameters } = getTotalsSQL(options);

  const bundle = {};

  return Accounts.lookupAccount(options.account_id)
    .then(account => {
      _.extend(bundle, { account });
      return db.exec(sql, parameters);
    })
    .then(transactions => {
      _.extend(bundle, { transactions });
      // get totals for this period
      return db.one(totalsQuery, totalsParameters);
    })
    .then(totals => {

      // if there is data in the transaction array, use the date of the last transaction
      const lastTransaction = bundle.transactions[bundle.transactions.length - 1];
      const lastDate = (lastTransaction && lastTransaction.trans_date) || options.dateTo;
      const lastCumSum = (lastTransaction && lastTransaction.cumsum) || (totals.balance * totals.rate);

      // contains the grid totals for the footer
      const footer = {
        date : lastDate,
        exchangedDebit : totals.debit * totals.rate,
        exchangedCredit : totals.credit * totals.rate,
        exchangedBalance : totals.balance * totals.rate,
        exchangedCumSum : lastCumSum,
        exchangedDate : new Date(),
        invertedRate : util.roundDecimal(1 / totals.rate, 2),
      };

      // combine shared properties
      _.merge(footer, totals);
      _.merge(bundle, { footer });

      return bundle;
    });
}

exports.document = document;
