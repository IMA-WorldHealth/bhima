const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');

const Accounts = require('../../accounts');

// TODO(@jniles) - merge this into the regular accounts controller
const AccountsExtra = require('../../accounts/extra');

const TEMPLATE = './server/controllers/finance/reports/reportAccounts/report.handlebars';
const BadRequest = require('../../../../lib/errors/BadRequest');

/**
 * global constants
 */
const sourceMap = {
  1 : {
    table : 'general_ledger',
    key : 'FORM.LABELS.GENERAL_LEDGER',
  },
  2 : {
    table : 'posting_journal',
    key : 'FORM.LABELS.POSTING_JOURNAL',
  },
  3 : {
    table : 'combined_ledger',
    key : 'FORM.LABELS.ALL',
  },
};

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

  if (!params.source) {
    throw new BadRequest('A source ID `source` must be specified.', 'ERRORS.BAD_REQUEST');
  }

  if (!params.account_id) {
    throw new BadRequest('Account ID missing', 'ERRORS.BAD_REQUEST');
  }

  params.user = req.session.user;
  params.sourceLabel = sourceMap[params.source].key;

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
        amount          : balance,
        isCreditBalance : balance < 0,
      };

      _.extend(bundle, { openingBalance });
      return getAccountTransactions(params.account_id, params.source, params.dateFrom, params.dateTo, balance);
    })
    .then((result) => {
      _.extend(bundle, {
        accountDetails : result.accountDetails,
        transactions : result.transactions,
        sum : result.sum,
        params });
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
function getAccountTransactions(accountId, source, dateFrom, dateTo, openingBalance) {
  const sourceId = parseInt(source, 10);
  let tableName;

  if (sourceId === 3) {
    tableName = `(
      (SELECT trans_id, description, account_id, trans_date, debit_equiv, credit_equiv, record_uuid
        FROM posting_journal ) 
      UNION (
      SELECT trans_id, description, account_id, trans_date, debit_equiv, credit_equiv, record_uuid
      FROM general_ledger )
    ) as comb `;
  } else {
    // get the table name
    tableName = sourceMap[sourceId].table;
  }

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
        @cumsum := balance + @cumsum AS cumsum
      FROM (
        SELECT trans_id, description, trans_date, document_map.text AS document_reference,
          SUM(debit_equiv) as debit, SUM(credit_equiv) as credit, (SUM(debit_equiv) - SUM(credit_equiv)) AS balance
        FROM ${tableName}
        LEFT JOIN document_map ON record_uuid = document_map.uuid
        WHERE account_id = ? ${dateCondition}
        GROUP BY record_uuid
        ORDER BY trans_date ASC
      )c, (SELECT @cumsum := ${openingBalance || 0})z
    ) AS groups
  `;

  const sqlAggrega = `
    SELECT SUM(t.debit) AS debit, SUM(t.credit) AS credit, SUM(t.debit - t.credit) AS balance
    FROM (
      SELECT SUM(debit_equiv) as debit, SUM(credit_equiv) AS credit
      FROM ${tableName}
      WHERE account_id = ? ${dateCondition}
      GROUP BY record_uuid
      ORDER BY trans_date ASC
    ) AS t
  `;

  const bundle = {};

  return Accounts.lookupAccount(accountId)
    .then((accountDetails) => {
      _.extend(bundle, { accountDetails });
      return db.exec(sql, params);
    })
    .then((transactions) => {
      _.extend(bundle, { transactions });
      return db.one(sqlAggrega, params);
    })
    .then((sum) => {
      // if the sum come back as zero (because there were no lines), set the default sum to the
      // opening balance
      sum.balance = sum.balance || openingBalance;
      _.extend(bundle, { sum });
      return bundle;
    });
}

exports.document = document;
