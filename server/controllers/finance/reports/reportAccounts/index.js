'use strict';

const ReportManager = require('../../../../lib/ReportManager');
const db            = require('../../../../lib/db');
const TEMPLATE      = './server/controllers/finance/reports/reportAccounts/report.handlebars';
const BadRequest    = require('../../../../lib/errors/BadRequest');

/**
 * @method document
 *
 * @description
 * generate Report of accounts as a document
 */
function document(req, res, next) {
  let report;

  let params = req.query;
  params.user = req.session.user;

  if (!params.account_id) {
    throw new BadRequest('Account ID missing', 'ERRORS.BAD_REQUEST');
  }

  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch(e) {
    return next(e);
  }

  return queryReportAccount(params.account_id, params.sourceId)
    .then(accounts => {

      let sum = {
        credit : 0,
        debit : 0,
        balance: 0
      };

      let title = {
        accountNumber : params.account_number,
        accountLabel : params.account_label,
        source       : params.sourceLabel
      };

      accounts.forEach(function (account) {
        sum.debit += account.debit;
        sum.credit += account.credit;
        sum.balance = sum.debit - sum.credit;
      });

      return report.render({ accounts, title, sum });

    })
    .then(result => {
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
  source = parseInt(source);
  let sql;

  if (source === 1) {
    sql = `
      SELECT general_ledger.trans_id, BUID(general_ledger.entity_uuid) AS entity_uuid, general_ledger.description,
      general_ledger.trans_date, general_ledger.debit_equiv as debit, general_ledger.credit_equiv as credit
      FROM general_ledger
      WHERE general_ledger.account_id = ?
      GROUP BY general_ledger.trans_id
      ORDER BY general_ledger.trans_date ASC;
    `;
  } else if (source === 2) {
    sql = `
      SELECT posting_journal.trans_id, BUID(posting_journal.entity_uuid) AS entity_uuid, posting_journal.description,
      posting_journal.trans_date, posting_journal.debit_equiv as debit, posting_journal.credit_equiv as credit
      FROM posting_journal
      WHERE posting_journal.account_id = ?
      GROUP BY posting_journal.trans_id
      ORDER BY posting_journal.trans_date ASC;
    `;
  } else if (source === 3) {
    sql = `
      SELECT transaction.trans_id, transaction.entity_uuid, transaction.description, transaction.trans_date, sum(transaction.credit_equiv) as credit, sum(transaction.debit_equiv) as debit
      FROM(
        SELECT posting_journal.trans_id, BUID(posting_journal.entity_uuid) AS entity_uuid, posting_journal.description,
        posting_journal.trans_date, posting_journal.debit_equiv, posting_journal.credit_equiv
        FROM posting_journal
        WHERE posting_journal.account_id = ?
        UNION
        SELECT general_ledger.trans_id, BUID(general_ledger.entity_uuid) AS entity_uuid, general_ledger.description,
        general_ledger.trans_date, general_ledger.debit_equiv, general_ledger.credit_equiv
        FROM general_ledger
        WHERE general_ledger.account_id = ?
      ) as transaction
      GROUP BY transaction.trans_id
      ORDER BY transaction.trans_date ASC;
    `;
  }

  return db.exec(sql, [accountId, accountId]);
}

exports.document = document;
