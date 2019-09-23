/**
 * @overview ./finance/reports/client_debts/
*/

const _ = require('lodash');
const moment = require('moment');

const ReportManager = require('../../../../lib/ReportManager');
const db = require('../../../../lib/db');

module.exports.report = report;

// path to the template to render
const TEMPLATE = './server/controllers/finance/reports/realized_profit/report.handlebars';

const DEFAULT_OPTIONS = {
  orientation : 'landscape',
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
      GROUP BY w.service_id, w.debtor_group_uuid 
    `;

    const tableQuery = `
      SELECT
        SUM(w.paid) paid, SUM(w.invoiced) invoiced, SUM(w.invoiced - w.paid) remaining,
        w.debtorGroupName, w.serviceName, w.service_id, w.debtor_group_uuid 
      FROM (
        ${standardPaymentQuery}
        
        UNION ALL 
        
        ${cautionPaymentQuery}
        
        UNION ALL 
        
        ${conventionPaymentQuery}
      )w 
    `;

    const parameters = [
      moment(dateFrom).format('YYYY-MM-DD'), moment(dateTo).format('YYYY-MM-DD'),
      moment(dateFrom).format('YYYY-MM-DD'), moment(dateTo).format('YYYY-MM-DD'),
      moment(dateFrom).format('YYYY-MM-DD'), moment(dateTo).format('YYYY-MM-DD'),
    ];

    const transaction = db.transaction();
    const tempTable = 'pivotSourceTable';
    const createTempTable = `
      CREATE TEMPORARY TABLE ${tempTable} AS (${tableQuery.concat(groupByServiceAndDebtorGroup)});
    `;

    transaction.addQuery(`DROP TEMPORARY TABLE IF EXISTS ${tempTable};`);
    transaction.addQuery(createTempTable, parameters);
    transaction.addQuery(`CALL Pivot('${tempTable}', 'debtorGroupName', 'serviceName', 'remaining', '', '')`);
    transaction.addQuery(`CALL Pivot('${tempTable}', 'debtorGroupName', 'serviceName', 'paid', '', '')`);
    transaction.addQuery(`CALL Pivot('${tempTable}', 'debtorGroupName', 'serviceName', 'invoiced', '', '')`);
    transaction.addQuery(`${tableQuery}`, parameters);

    const rows = await transaction.execute();
    const remainingTable = rows[2][0];
    const remainingMatrix = matrix(remainingTable);

    const paidTable = rows[3][0];
    const paidMatrix = matrix(paidTable);

    const invoicedTable = rows[4][0];
    const invoicedMatrix = matrix(invoicedTable);

    const [totals] = rows[5];
    totals.paidRatio = totals.invoiced ? (totals.paid / totals.invoiced) : 0;
    totals.remainingRatio = totals.invoiced ? (totals.remaining / totals.invoiced) : 0;

    const result = await rpt.render({
      dateFrom,
      dateTo,
      totals,
      remainingMatrix,
      paidMatrix,
      invoicedMatrix,
      showRemainDetails,
      showPaidDetails,
      showInvoicedDetails,
    });

    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}

function matrix(dataset) {
  const headers = Object.keys(dataset[dataset.length - 1] || {}).filter(col => col !== 'debtorGroupName');
  const data = dataset.map(row => {
    const values = headers.map(key => row[key]);
    return [row.debtorGroupName, ...values];
  });
  return { headers, data };
}
