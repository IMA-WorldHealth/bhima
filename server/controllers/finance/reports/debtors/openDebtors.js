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

// path to the template to render
const TEMPLATE = './server/controllers/finance/reports/debtors/openDebtors.handlebars';

/**
 * Actually builds the open debtor report.
 *
 * @todo - allow limiting by date
 */
function build(req, res, next) {
  const qs = _.extend(req.query, { csvKey : 'debtors' });
  const metadata = _.clone(req.session);

  let report;

  try {
    report = new ReportManager(TEMPLATE, metadata, qs);
  } catch (e) {
    return next(e);
  }

  let ordering;

  switch (qs.order) {
  case 'payment-date-asc':
    ordering = 'lastPaymentDate ASC';
    break;

  case 'payment-date-desc':
    ordering = 'lastPaymentDate DESC';
    break;

  case 'invoice-date-asc':
    ordering = 'lastInvoiceDate ASC';
    break;

  case 'invoice-date-desc':
    ordering = 'lastInvoiceDate DESC';
    break;

  case 'debt-desc':
    ordering = 'ledger.balance DESC';
    break;

  case 'patient-name-desc':
    ordering = 'patient.display_name DESC';
    break;

  case 'patient-name-asc':
    ordering = 'patient.display_name ASC';
    break;

  case 'debt-asc':
    ordering = 'ledger.balance ASC';
    break;

  default:
    ordering = 'cash.date ASC';
    break;
  }

  /*
   * The SQL query first looks for all entity_uuids in the combined Posting
   * Journal and General Ledger to find unbalanced accounts, then links them
   * with invoices and cash payments.
   */

  const debtorsSql = `
    SELECT patient.display_name, entity_map.text AS reference, MAX(invoice.date) AS lastInvoiceDate,
      MAX(cash.date) AS lastPaymentDate, ledger.balance AS debt
    FROM patient JOIN entity_map ON patient.uuid = entity_map.uuid
      JOIN invoice ON patient.debtor_uuid = invoice.debtor_uuid
      LEFT JOIN cash ON patient.debtor_uuid = cash.debtor_uuid
      JOIN (
        SELECT c.entity_uuid, SUM(c.debit_equiv) AS debit, SUM(c.credit_equiv) AS credit,
          SUM(c.debit_equiv - c.credit_equiv) AS balance
        FROM (
          (
            SELECT entity_uuid, debit_equiv, credit_equiv FROM posting_journal)
          UNION (
            SELECT entity_uuid, debit_equiv, credit_equiv FROM general_ledger
          )
        ) AS c
        WHERE c.entity_uuid IN (SELECT patient.debtor_uuid FROM patient)
        GROUP BY c.entity_uuid
        HAVING balance > 0
      ) AS ledger ON ledger.entity_uuid = patient.debtor_uuid
    GROUP BY patient.debtor_uuid
    ORDER BY ${ordering};
  `;

  /*
   * Aggregate SQL for totalling all debts up to the present
   */
  const aggregateSql = `
    SELECT COUNT(a.entity_uuid) AS numDebtors, SUM(a.debit) AS debit, SUM(a.credit) AS credit, SUM(a.balance) AS balance
    FROM(
      SELECT c.entity_uuid, SUM(c.debit_equiv) AS debit, SUM(c.credit_equiv) AS credit,
        SUM(c.debit_equiv - c.credit_equiv) AS balance
      FROM (
        (
          SELECT entity_uuid, debit_equiv, credit_equiv FROM posting_journal)
        UNION (
          SELECT entity_uuid, debit_equiv, credit_equiv FROM general_ledger
        )
      ) AS c
      WHERE c.entity_uuid IN (SELECT patient.debtor_uuid FROM patient)
      GROUP BY c.entity_uuid
      HAVING balance > 0
    ) AS a;
  `;

  const data = {};

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
}

exports.report = build;
