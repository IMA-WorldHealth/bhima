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

  return queryReportAccount(params.account_id, params.sourceId)
    .then((result) => {
      _.extend(bundle, { accounts: result.accounts, sum: result.sum, title });

      return report.render(bundle);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}


/**
 * @function queryReportAccount
 * This feature select all transactions for a specific account
*/
function queryReportAccount(accountId, source) {
  const sourceId = parseInt(source, 10);

  // get the table name
  const tableName = sourceMap[sourceId];

  const sql = `
      SELECT trans_id, BUID(entity_uuid) AS entity_uuid, description, trans_date, 
        debit_equiv as debit, credit_equiv as credit
      FROM ${tableName}
      WHERE account_id = ?
      GROUP BY trans_id 
      ORDER BY trans_date ASC`;

  const sqlAggrega = ` SELECT SUM(t.debit) AS debit, SUM(t.credit) AS credit, SUM(t.debit - t.credit) AS balance 
    FROM (
      SELECT trans_id, BUID(entity_uuid) AS entity_uuid, description, trans_date, 
        debit_equiv as debit, credit_equiv as credit
      FROM ${tableName}
      WHERE account_id = ?
      GROUP BY trans_id 
      ORDER BY trans_date ASC
    ) AS t 
    `;

  const bundle = {};

  return db.exec(sql, [accountId, accountId])
    .then((accounts) => {
      _.extend(bundle, { accounts });
      return db.one(sqlAggrega, [accountId, accountId]);
    })
    .then((sum) => {
      _.extend(bundle, { sum });
      return bundle;
    });
}

exports.document = document;
