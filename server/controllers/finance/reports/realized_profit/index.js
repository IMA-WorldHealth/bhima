/**
 * @overview ./finance/reports/client_debts/
*/

const _ = require('lodash');
const QuickPivot = require('quick-pivot');

const ReportManager = require('../../../../lib/ReportManager');
const db = require('../../../../lib/db');

module.exports.report = report;

// path to the template to render
const TEMPLATE = './server/controllers/finance/reports/realized_profit/report.handlebars';

const DEFAULT_OPTIONS = {
  footerRight : '[page] / [toPage]',
  footerFontSize : '7',
};

/**
 * @method report
 *
 * @description
 * The HTTP interface which actually creates the report.
 */
async function report(req, res, next) {
  try {
    const qs = _.extend(req.query, DEFAULT_OPTIONS);
    const { dateFrom, dateTo } = req.query;
    const showRemainDetails = parseInt(req.query.shouldShowRemainDetails, 10);
    const showPaidDetails = parseInt(req.query.shouldShowPaidDetails, 10);
    const showInvoicedDetails = parseInt(req.query.shouldShowInvoicedDetails, 10);
    const metadata = _.clone(req.session);

    const rpt = new ReportManager(TEMPLATE, metadata, qs);

    const INVOICE_TRANSACTION_TYPE = 11;
    const CAUTION_TRANSACTION_TYPE = 19;
    const CONVENTION_TRANSACTION_TYPE = 3;

    const standardPaymentQuery = `
    (SELECT
      SUM(gl.credit_equiv - gl.debit_equiv) AS paid, z.invoiced, dg.name debtorGroupName, s.name serviceName,
      iv.uuid AS invoice_uuid, s.id AS service_id, dg.uuid AS debtor_group_uuid
    FROM general_ledger gl 
    JOIN cash c ON c.uuid = gl.record_uuid
    JOIN invoice iv ON iv.uuid = gl.reference_uuid
    JOIN service s ON s.id = iv.service_id
    JOIN (
      SELECT record_uuid, SUM(debit_equiv) AS invoiced FROM general_ledger
      WHERE transaction_type_id = ${INVOICE_TRANSACTION_TYPE} AND (DATE(trans_date) >= ? AND DATE(trans_date) <= ?)
      GROUP BY record_uuid
    )z ON z.record_uuid = iv.uuid
    JOIN debtor d ON d.uuid = gl.entity_uuid
    JOIN debtor_group dg ON dg.uuid = d.group_uuid
    WHERE iv.reversed = 0 
    GROUP BY iv.uuid, iv.service_id, dg.uuid)
    `;

    const cautionPaymentQuery = `
    (SELECT
      SUM(gl.debit_equiv) AS paid, z.invoiced, z.debtorGroupName, z.serviceName,
      z.invoice_uuid, z.service_id, z.debtor_group_uuid
    FROM general_ledger gl 
    JOIN cash c ON c.uuid = gl.reference_uuid
    JOIN (
      SELECT
        gl2.record_uuid, SUM(gl2.credit_equiv - gl2.debit_equiv) invoiced,
        iv.uuid AS invoice_uuid, s.id AS service_id, s.name AS serviceName,
        dg.uuid AS debtor_group_uuid, dg.name AS debtorGroupName 
      FROM general_ledger gl2
      JOIN invoice iv ON iv.uuid = gl2.reference_uuid
      JOIN service s ON s.id = iv.service_id
      JOIN debtor d ON d.uuid = gl2.entity_uuid
      JOIN debtor_group dg ON dg.uuid = d.group_uuid
      WHERE transaction_type_id = ${CAUTION_TRANSACTION_TYPE} AND iv.reversed = 0 
        AND (DATE(gl2.trans_date) >= ? AND DATE(gl2.trans_date) <= ?)
      GROUP BY gl2.record_uuid
    )z ON z.record_uuid = gl.record_uuid
    WHERE gl.transaction_type_id = ${CAUTION_TRANSACTION_TYPE}
    GROUP BY z.invoice_uuid, z.service_id, z.debtor_group_uuid)
    `;

    const conventionPaymentQuery = `
    (SELECT
      SUM(gl.debit_equiv) AS paid, z.invoiced, z.debtorGroupName, z.serviceName,
      z.invoice_uuid, z.service_id, z.debtor_group_uuid
    FROM general_ledger gl  
    JOIN (
      SELECT
        gl2.record_uuid, SUM(gl2.credit_equiv - gl2.debit_equiv) invoiced,
        iv.uuid AS invoice_uuid, s.id AS service_id, s.name AS serviceName,
        dg.uuid AS debtor_group_uuid, dg.name AS debtorGroupName 
      FROM general_ledger gl2
      JOIN invoice iv ON iv.uuid = gl2.reference_uuid
      JOIN service s ON s.id = iv.service_id
      JOIN debtor d ON d.uuid = gl2.entity_uuid
      JOIN debtor_group dg ON dg.uuid = d.group_uuid
      WHERE transaction_type_id = ${CONVENTION_TRANSACTION_TYPE} AND iv.reversed = 0
        AND (DATE(gl2.trans_date) >= ? AND DATE(gl2.trans_date) <= ?)
      GROUP BY gl2.record_uuid
    )z ON z.record_uuid = gl.record_uuid
    WHERE gl.transaction_type_id = ${CONVENTION_TRANSACTION_TYPE}
    GROUP BY z.invoice_uuid, z.service_id, z.debtor_group_uuid)
    `;

    const groupByServiceAndDebtorGroup = `
      GROUP BY w.service_id, w.debtor_group_uuid ORDER BY w.serviceName, w.debtorGroupName ASC 
    `;

    const tableQuery = `
      SELECT
        SUM(w.paid) paid, SUM(w.invoiced) invoiced, SUM(w.invoiced - w.paid) remaining, 
        (w.paid / w.invoiced) * 100 remaining_ration, w.debtorGroupName,
        w.serviceName, w.service_id, w.debtor_group_uuid 
      FROM (
        ${standardPaymentQuery}
        
        UNION ALL 
        
        ${cautionPaymentQuery}
        
        UNION ALL 
        
        ${conventionPaymentQuery}
      )w 
    `;

    const parameters = [
      dateFrom, dateTo,
      dateFrom, dateTo,
      dateFrom, dateTo,
    ];

    const [dataArray, totals] = await Promise.all([
      db.exec(tableQuery.concat(groupByServiceAndDebtorGroup), parameters),
      db.one(tableQuery, parameters),
    ]);

    const rowsToPivot = ['debtorGroupName'];
    const colsToPivot = ['serviceName'];
    const aggregator = 'sum';
    const nullTable = { data : {} };

    const pivotRemaining = showRemainDetails
      ? new QuickPivot(dataArray, rowsToPivot, colsToPivot, 'remaining', aggregator) : nullTable;

    const pivotPaid = showPaidDetails
      ? new QuickPivot(dataArray, rowsToPivot, colsToPivot, 'paid', aggregator) : nullTable;

    const pivotInvoiced = showInvoicedDetails
      ? new QuickPivot(dataArray, rowsToPivot, colsToPivot, 'invoiced', aggregator) : nullTable;

    const remainingTable = pivotRemaining.data.table;
    const paidTable = pivotPaid.data.table;
    const invoicedTable = pivotInvoiced.data.table;

    const result = await rpt.render({
      dateFrom,
      dateTo,
      totals,
      remainingTable,
      paidTable,
      invoicedTable,
      showRemainDetails,
      showPaidDetails,
      showInvoicedDetails,
    });

    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}
