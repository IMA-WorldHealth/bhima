const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');

const TEMPLATE = './server/controllers/finance/reports/reportAccounts/report.handlebars';
const BadRequest = require('../../../../lib/errors/BadRequest');
const Exchange = require('../../exchange');

/**
 * global constants
 */
const sourceMap = { 1: 'general_ledger', 2: 'posting_journal', 3: 'combined_ledger' };

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
  let exchangeRate;

  const params = req.query;

  const title = {
    accountNumber : params.account_number,
    accountLabel  : params.account_label,
    source        : params.sourceLabel,
    dateFrom      : params.dateFrom,
    dateTo        : params.dateTo,
    currency_id   : params.currency_id
  };

  params.user = req.session.user;
  params.current_date = new Date();

  if (!params.account_id) {
    throw new BadRequest('Account ID missing', 'ERRORS.BAD_REQUEST');
  }

  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    return next(e);
  }

  return Exchange.getExchangeRate(params.user.enterprise_id, params.currency_id, params.current_date)
    .then(function (exchange) {
      exchangeRate = exchange.rate ? exchange.rate : 1;

      return getAccountTransactions(params.account_id, params.sourceId, params.dateFrom, params.dateTo, exchangeRate);
    })  
    .then((result) => {
      _.extend(bundle, { transactions: result.transactions, sum: result.sum, title });

      return report.render(bundle);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}


/**
 * @function getAccountTransactions
 * This feature select all transactions for a specific account
*/
function getAccountTransactions(accountId, source, dateFrom, dateTo, exchangeRate) {
  const sourceId = parseInt(source, 10);
  const reqCombinedLedger = `
    (
      (
        SELECT trans_id, description, trans_date, debit_equiv, credit_equiv, record_uuid, account_id 
          FROM posting_journal 
      ) UNION (
        SELECT trans_id, description, trans_date, debit_equiv, credit_equiv, record_uuid, account_id 
          FROM general_ledger
      )
    )`;
  
  // get the table name OR union of posting-journal and combined ledger
  const tableName = sourceId === 3 ? reqCombinedLedger : sourceMap[sourceId];
  
  const params = [accountId];

  let dateCondition = '';

  if (dateFrom && dateTo) {
    dateCondition = 'AND DATE(tab.trans_date) BETWEEN DATE(?) AND DATE(?)';
    params.push(new Date(dateFrom), new Date(dateTo));
  }

  const sql = `
    SELECT groups.trans_id, (groups.debit * ${exchangeRate}) AS debit, (groups.credit * ${exchangeRate}) AS credit, groups.trans_date,
      groups.document_reference, (groups.cumsum * ${exchangeRate}) AS cumsum, groups.description
    FROM (
      SELECT trans_id, description, trans_date, document_reference, debit, credit,
        @cumsum := balance + @cumsum AS cumsum
      FROM (
        SELECT tab.trans_id, tab.description, tab.trans_date, document_map.text AS document_reference,
          SUM(tab.debit_equiv) as debit, SUM(tab.credit_equiv) as credit, (SUM(tab.debit_equiv) - SUM(tab.credit_equiv)) AS balance
        FROM ${tableName} AS tab
        LEFT JOIN document_map ON tab.record_uuid = document_map.uuid
        WHERE tab.account_id = ? ${dateCondition}
        GROUP BY tab.record_uuid
        ORDER BY tab.trans_date ASC
      )c, (SELECT @cumsum := 0)z
    ) AS groups
  `;

  const sqlAggrega = `
    SELECT (SUM(t.debit) * ${exchangeRate}) AS debit, (SUM(t.credit) * ${exchangeRate}) AS credit, (SUM(t.debit - t.credit) * ${exchangeRate}) AS balance
    FROM (
      SELECT SUM(tab.debit_equiv) as debit, SUM(tab.credit_equiv) AS credit
      FROM ${tableName} AS tab
      WHERE tab.account_id = ? ${dateCondition}
      GROUP BY tab.record_uuid
      ORDER BY tab.trans_date ASC
    ) AS t
  `;

  const bundle = {};

  return db.exec(sql, params)
    .then((transactions) => {
      _.extend(bundle, { transactions });
      return db.one(sqlAggrega, params);
    })
    .then((sum) => {
      _.extend(bundle, { sum });
      return bundle;
    });
}

exports.document = document;
