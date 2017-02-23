const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');

const TEMPLATE = './server/controllers/finance/reports/reportAccounts/report.handlebars';
const BadRequest = require('../../../../lib/errors/BadRequest');

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

  const params = req.query;

  const title = {
    accountNumber : params.account_number,
    accountLabel  : params.account_label,
    source        : params.sourceLabel,
    dateFrom      : params.dateFrom,
    dateTo        : params.dateTo,
  };

  params.user = req.session.user;

  if (!params.account_id) {
    throw new BadRequest('Account ID missing', 'ERRORS.BAD_REQUEST');
  }

  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    return next(e);
  }

  return getAccountTransactions(params.account_id, params.sourceId, params.dateFrom, params.dateTo)
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
function getAccountTransactions(accountId, source, dateFrom, dateTo) {
  const sourceId = parseInt(source, 10);

  // get the table name
  const tableName = sourceMap[sourceId];
  const params = [accountId];
  let dateCondition = '';

  if (dateFrom && dateTo) {
    dateCondition = 'AND DATE(trans_date) BETWEEN DATE(?) AND DATE(?)';
    params.push(dateFrom, dateTo);
  }

  const csum = 'SET @csum := 0;';

  const sql = `
    SELECT a.trans_id, a.debit, a.credit, a.balance, a.trans_date, (@csum := @csum + a.balance) AS cumulBalance,
      a.description
    FROM (
      SELECT trans_id, BUID(entity_uuid) AS entity_uuid, description, trans_date,
        SUM(debit_equiv) as debit, SUM(credit_equiv) as credit, (SUM(debit_equiv) - SUM(credit_equiv)) AS balance
      FROM ${tableName}
      WHERE account_id = ? ${dateCondition}
      GROUP BY trans_id
      ORDER BY trans_date ASC
    ) AS a`;


  const sqlAggrega = `
    SELECT SUM(t.debit) AS debit, SUM(t.credit) AS credit, SUM(t.debit - t.credit) AS balance
    FROM (
      SELECT trans_id, BUID(entity_uuid) AS entity_uuid, description, trans_date,
        SUM(debit_equiv) as debit, SUM(credit_equiv) as credit
      FROM ${tableName}
      WHERE account_id = ? ${dateCondition}
      GROUP BY trans_id
      ORDER BY trans_date ASC
    ) AS t
    `;

  const bundle = {};
  return db.exec(csum)
    .then(() => db.exec(sql, params))
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
