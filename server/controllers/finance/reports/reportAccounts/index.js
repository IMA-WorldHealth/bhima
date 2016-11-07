'use strict';

const Accounts = require('../../accounts');
const ReportManager = require('../../../../lib/ReportManager');

const TEMPLATE = './server/controllers/finance/reports/accounts/chart.handlebars';

/**
 * @method document
 *
 * @description
 * generate chart of account as a document
 */
function document(req, res, next) {

  let report;

  let params = req.query;
  params.user = req.session.user;

  // build the main part of the SQL query
  let sql = `
    SELECT transaction.trans_id, transaction.entity_uuid, transaction.description, transaction.trans_date, sum(transaction.credit_equiv) as credit, sum(transaction.debit_equiv) as debit,
    transaction.reference, transaction.abbr
    FROM(
      SELECT posting_journal.trans_id, BUID(posting_journal.entity_uuid) AS entity_uuid, posting_journal.description,
      posting_journal.trans_date, posting_journal.debit_equiv, posting_journal.credit_equiv, invoice.reference, project.abbr
      FROM posting_journal
      LEFT JOIN invoice ON invoice.uuid = posting_journal.record_uuid
      LEFT JOIN project ON invoice.project_id = project.id
      WHERE posting_journal.entity_uuid = ? AND posting_journal.entity_type = 'D'
      UNION 
      SELECT general_ledger.trans_id, BUID(general_ledger.entity_uuid) AS entity_uuid, general_ledger.description,
      general_ledger.trans_date, general_ledger.debit_equiv, general_ledger.credit_equiv, invoice.reference, project.abbr
      FROM general_ledger
      LEFT JOIN invoice ON invoice.uuid = general_ledger.record_uuid
      LEFT JOIN project ON invoice.project_id = project.id 
      WHERE general_ledger.entity_uuid = ? AND general_ledger.entity_type = 'D'
    ) as transaction
    GROUP BY transaction.trans_id 
    ORDER BY transaction.trans_date ASC;`;


  console.log('KKKKKKKKKKKKKKKKKKK');
  console.log(params);
  console.log(sql);
  console.log('HHHHHHHH');

/*
  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch(e) {
    return next(e);
  }

  Accounts.lookupAccount()
    .then(Accounts.processAccountDepth)
    .then(accounts => {
      return report.render({ accounts });
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();*/
}

exports.document = document;
