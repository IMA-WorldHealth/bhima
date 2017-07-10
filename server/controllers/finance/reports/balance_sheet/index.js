/**
 * Balance sheet Controller
 *
 * This controller is responsible for processing
 * the balance sheet (bilan) report.
 *
 * @module reports/balance_sheet
 *
 * @requires lodash
 * @requires lib/db
 * @requires lib/ReportManager
 * @requires lib/errors/BadRequest
 */

const _ = require('lodash');
const moment = require('moment');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');

// report template
const TEMPLATE = './server/controllers/finance/reports/balance_sheet/report.handlebars';

const ASSET = 1;
const LIABILITY = 2;
const EQUITY = 3;
const REVENUE = 4;
const EXPENSE = 5;
const DATE_FORMAT = 'YYYY-MM-DD';
const FC_CURRENCY = 1;


// expose to the API
exports.document = document;

/**
 * @function document
 * @description process and render the balance report document
 */
function document(req, res, next) {
  const params = req.query;
  const session = {};
  const bundle = {};
  let report;

  // date options
  if (params.dateFrom && params.dateTo) {
    session.dateFrom = moment(params.dateFrom).format(DATE_FORMAT);
    session.dateTo = moment(params.dateTo).format(DATE_FORMAT);
  } else {
    session.date = moment(params.date).format(DATE_FORMAT);
  }

  session.enterprise = req.session.enterprise;
  params.enterpriseId = session.enterprise.id;

  _.defaults(params, { user : req.session.user });

  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    next(e);
    return;
  }

  computeBalanceSheet(params)
    .then(GroupAccountByType)
    .then(processAccounts)
    .then((result) => {
      bundle.session = session;
      bundle.showExploitation = Number(params.showExploitation || 0);
      bundle.assets = result[ASSET] || {};
      bundle.liabilities = result[LIABILITY] || {};
      bundle.equity = result[EQUITY] || {};
      bundle.revenue = result[REVENUE] || {};
      bundle.expense = result[EXPENSE] || {};
      bundle.result = handleExploitationResult(bundle.revenue, bundle.expense);
      bundle.totals = getTotalBalance(bundle);

      // get the exchange rate for the given date
      const query = `
        SELECT e.rate, c.symbol, c.name, e.currency_id FROM exchange_rate e 
        JOIN currency c ON c.id = e.currency_id 
        WHERE e.currency_id = ? AND DATE(e.date) <= DATE(?) AND e.enterprise_id = ?
        ORDER BY e.id DESC LIMIT 1;`;
      return db.exec(query, [FC_CURRENCY, session.date, session.enterprise.id]);
    })
    .then((rate) => {
      bundle.rate = rate.pop() || {};
      return report.render(bundle);
    })
    .then((result) => res.set(result.headers).send(result.report))
    .catch(next)
    .done();
}

/**
 * getBalance
 *
 * @param {object} element
 */
function getBalance(element) {
  return element.totals ? element.totals.balance : 0;
}

/**
 * handleExploitationResult
 *
 * @param {object} revenue
 * @param {object} expense
 * @returns {object}
 */
function handleExploitationResult(revenue, expense) {
  const _revenue = getBalance(revenue) * -1;
  const _expense = getBalance(expense);
  return { balance : _revenue - _expense };
}


/**
 * getTotalBalance
 *
 * @param {object} bundle
 */
function getTotalBalance(bundle) {
  const assets = getBalance(bundle.assets);
  const liabilities = getBalance(bundle.liabilities);
  const equity = getBalance(bundle.equity);
  const result = bundle.result.balance;

  const totals = { debit : [], credit : [] };
  if (assets >= 0) { totals.debit.push(assets); } else { totals.credit.push(assets * -1); }
  if (liabilities >= 0) { totals.debit.push(liabilities); } else { totals.credit.push(liabilities * -1); }
  if (equity >= 0) { totals.debit.push(equity); } else { totals.credit.push(equity * -1); }
  if (result >= 0) { totals.credit.push(result); } else { totals.debit.push(result * -1); }

  return {
    debit : totals.debit.reduce(sum, 0),
    credit : totals.credit.reduce(sum, 0),
  };
}

// sum aggrega
function sum(a, b) {
  return a + b;
}

/**
 * @method processAccounts
 * @description process and format accounts balance
 * @param {object} balances The result of balanceReporting function
 */
function processAccounts(data) {
  const collection = Object.keys(data);
  const bundle = {};

  collection.forEach((type) => {
    const balances = data[type];

    const accounts = balances.reduce((account, row) => {
      const id = row.number;
      const obj = {};
      account[id] = obj;
      obj.label = row.label;
      obj.number = row.number;
      obj.debit = row.debit;
      obj.credit = row.credit;
      obj.balance = row.balance;
      obj.is_charge = row.is_charge;
      obj.is_asset = row.is_asset;
      return account;
    }, {});

    // process for getting totals
    const totals = Object.keys(accounts)
    .reduce((t, key) => {
      const account = accounts[key];
      t.debit += (account.debit || 0);
      t.credit += (account.credit || 0);
      t.balance += (account.balance || 0);
      return t;
    }, {
      debit   : 0,
      credit  : 0,
      balance  : 0,
    });

    bundle[type] = { accounts, totals };
  });

  return bundle;
}

/**
 * GroupAccountByType
 * @description group accounts by account type
 * @param {array} rows - data from computeBalanceSheet
 * @returns {object}
 */
function GroupAccountByType(rows) {
  return _.groupBy(rows, 'type_id');
}

/**
 * @function computeBalanceSheet
 * @description return the balance sheet data according given parameters
 * @param {object} params An object which contains dates range and the account class
 */
function computeBalanceSheet(params) {
  const query = params;

  query.date = moment(query.date).format(DATE_FORMAT);

  // gets the amount up to the current period
  const sql = `
    SELECT a.number, a.id, a.label, a.type_id,
      SUM(pt.credit) AS credit, SUM(pt.debit) AS debit, SUM(pt.debit - pt.credit) AS balance 
    FROM period_total AS pt JOIN account AS a ON pt.account_id = a.id
    JOIN period AS p ON pt.period_id = p.id
    WHERE pt.enterprise_id = ?  
      AND (DATE(p.start_date) <= DATE(?) OR (p.start_date IS NULL OR p.end_date IS NULL))
      AND pt.fiscal_year_id = (SELECT f.id FROM fiscal_year f WHERE DATE(?) BETWEEN DATE(f.start_date) AND DATE(f.end_date) LIMIT 1)
    GROUP BY a.id `;

  const queryParameters = [query.enterpriseId, query.date, query.date];

  return db.exec(sql, queryParameters);
}
