/**
 * @overview finance/reports/debtors/open.js
 *
 * @description
 * This report concerns the debtors that have open balances
 * The typical age categories are 0-30 days, 30-60 days, 60-90 days, and > 90
 * days.
 *
 * As usual, the reports are created with a handlebars template and shipped to
 * the client as either JSON, HTML, or PDF, depending on the renderer specified
 * in the HTTP query string.
 */

const _ = require('lodash');
const ReportManager = require('../../../../lib/ReportManager');
const db = require('../../../../lib/db');
const Exchange = require('../../exchange');

// path to the template to render
const TEMPLATE = './server/controllers/finance/reports/debtors/openDebtors.handlebars';

/**
 * Actually builds the open debtor report.
 *
 * @todo - allow limiting by date
 */
function build(req, res, next) {
  const qs = _.extend(req.query, { csvKey: 'debtors' });
  const metadata = _.clone(req.session);

  let report;
  let exchangeRate;

  try {
    report = new ReportManager(TEMPLATE, metadata, qs);
  } catch (e) {
    return next(e);
  }

  let ordering;

  switch (qs.order) {
  case 'payment-date-asc':
    ordering = 'cash.date ASC';
    break;

  case 'payment-date-desc':
    ordering = 'cash.date DESC';
    break;

  case 'invoice-date-asc':
    ordering = 'invoice.date ASC';
    break;

  case 'invoice-date-desc':
    ordering = 'invoice.date DESC';
    break;

  case 'debt-desc':
    ordering = 'ledger.balance DESC';
    break;

  case 'debt-asc':
    ordering = 'ledger.balance ASC';
    break;

  default:
    ordering = 'cash.date ASC';
    break;
  }

  return Exchange.getExchangeRate(metadata.user.enterprise_id, qs.currency_id, new Date())
  .then(function (exchange) {
    exchangeRate = exchange.rate ? exchange.rate : 1;

    /*
     * The SQL query first looks for all entity_uuids in 
     * Journal and General Ledger to find unbalanced accounts, then links them
     * with invoices and cash payments.
     */
    const debtorsSql = `
      SELECT patient.display_name, entity_map.text AS reference, MAX(invoice.date) AS lastInvoiceDate,
        MAX(cash.date) AS lastPaymentDate, ledger.balance * ${exchangeRate} AS debt
      FROM patient JOIN entity_map ON patient.uuid = entity_map.uuid
        JOIN invoice ON patient.debtor_uuid = invoice.debtor_uuid
        JOIN cash ON patient.debtor_uuid = cash.debtor_uuid
        JOIN (
          SELECT l.entity_uuid, SUM(l.debit_equiv) AS debit, SUM(l.credit_equiv) AS credit,
            SUM(l.debit_equiv - l.credit_equiv) AS balance
          FROM (
            ( SELECT posting_journal.trans_id, posting_journal.entity_uuid, posting_journal.debit_equiv, posting_journal.credit_equiv
              FROM posting_journal
            ) UNION (
              SELECT general_ledger.trans_id, general_ledger.entity_uuid, general_ledger.debit_equiv, general_ledger.credit_equiv
              FROM general_ledger                      
            )
          ) AS l
          WHERE l.entity_uuid IN (SELECT patient.debtor_uuid FROM patient)
          GROUP BY l.entity_uuid
          HAVING balance > 0
        ) AS ledger ON ledger.entity_uuid = patient.debtor_uuid
      GROUP BY patient.debtor_uuid
      ORDER BY ${ordering};
    `;

    /*
     * Aggregate SQL for totalling all debts up to the present
     */
    const aggregateSql = `
      SELECT COUNT(DISTINCT(c.entity_uuid)) AS numDebtors, SUM(c.debit_equiv) * ${exchangeRate} AS debit,
        SUM(c.credit_equiv) * ${exchangeRate} AS credit, SUM(c.debit_equiv - c.credit_equiv) * ${exchangeRate} AS balance
      FROM (
      (
        SELECT entity_uuid, debit_equiv, credit_equiv, trans_id
        FROM posting_journal
      ) UNION (
        SELECT entity_uuid, debit_equiv, credit_equiv, trans_id
        FROM general_ledger   
      )
    ) AS c
      WHERE c.entity_uuid IN (SELECT patient.debtor_uuid FROM patient);
    `;

    const data = {};
    data.currency_id =  qs.currency_id;
    
    // execute the query and build the report
    return db.exec(debtorsSql)
      .then((debtors) => {
        data.debtors = debtors;
        return db.one(aggregateSql);
      })
      .then((aggregates) => {
        data.aggregates = aggregates;
        return report.render(data);
      })
      .then(result => res.set(result.headers).send(result.report))
      .catch(next)
      .done();




  });

}

exports.report = build;
