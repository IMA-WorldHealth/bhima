/**
 * @overview ./finance/reports/client_debts/
*/

const _ = require('lodash');

const ReportManager = require('../../../../lib/ReportManager');
const db = require('../../../../lib/db');

module.exports.report = report;

// path to the template to render
const TEMPLATE = './server/controllers/finance/reports/client_debts/report.handlebars';

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
    const groupUuid = req.query.group_uuid;
    const showDetails = parseInt(req.query.shouldShowDebtsDetails, 10);
    const metadata = _.clone(req.session);

    const rpt = new ReportManager(TEMPLATE, metadata, qs);

    const SUPPORT_TRANSACTION_TYPE = 4;

    const patientsDebtsQuery = `
      SELECT em.text AS reference, p.display_name, dg.name, SUM(gl.debit_equiv - gl.credit_equiv) AS balance
      FROM general_ledger gl 
      JOIN debtor_group dg ON dg.account_id = gl.account_id
      JOIN patient p ON p.debtor_uuid = gl.entity_uuid
      JOIN entity_map AS em ON em.uuid = p.uuid
      WHERE dg.account_id = ? AND (gl.trans_date BETWEEN ? AND ?) 
    `;

    const employeesDebtsQuery = `
      SELECT em.text AS reference, p.display_name, dg.name, SUM(gl.debit_equiv - gl.credit_equiv) AS balance
      FROM general_ledger gl 
      JOIN debtor_group dg ON dg.account_id = gl.account_id
      JOIN patient p ON p.debtor_uuid = gl.entity_uuid
      JOIN employee e ON e.patient_uuid = p.uuid
      JOIN entity_map AS em ON em.uuid = p.uuid
      WHERE dg.account_id = ? AND (gl.trans_date BETWEEN ? AND ?) 
    `;

    const notEmployeesDebtsQuery = `
      SELECT em.text AS reference, p.display_name, dg.name, SUM(gl.debit_equiv - gl.credit_equiv) AS balance
      FROM general_ledger gl 
      JOIN debtor_group dg ON dg.account_id = gl.account_id
      JOIN patient p ON p.debtor_uuid = gl.entity_uuid
      JOIN entity_map AS em ON em.uuid = p.uuid
      WHERE dg.account_id = ? AND (gl.trans_date BETWEEN ? AND ?)
        AND p.uuid NOT IN (SELECT patient_uuid as uuid FROM employee) 
    `;

    const clientSupportDebtsQuery = `
      SELECT em.text as reference, p.display_name, SUM(gl.debit_equiv - gl.credit_equiv) AS balance
      FROM general_ledger gl 
      JOIN employee e ON e.creditor_uuid = gl.entity_uuid
      JOIN patient p ON p.uuid = e.patient_uuid
      JOIN entity_map AS em ON em.uuid = e.creditor_uuid
      WHERE p.debtor_uuid IN (SELECT uuid AS uuid FROM debtor WHERE group_uuid = ?) 
        AND (gl.trans_date BETWEEN ? AND ?) AND gl.transaction_type_id = ${SUPPORT_TRANSACTION_TYPE} 
    `;

    const clientQuery = `
      SELECT uuid, name, account_id FROM debtor_group WHERE uuid = ?;
    `;

    const client = await db.one(clientQuery, [db.bid(groupUuid)]);

    const groupByEntity = ' GROUP BY gl.entity_uuid ORDER BY p.display_name; ';
    const parameters = [client.account_id, dateFrom, dateTo];
    const parameters2 = [client.uuid, dateFrom, dateTo];

    // const patientsDebtsTotal = await db.one(patientsDebtsQuery, parameters);
    // const patientsDebts = await db.exec(patientsDebtsQuery.concat(groupByEntity), parameters);

    // const employeesDebtsTotal = await db.one(employeesDebtsQuery, parameters);
    // const employeesDebts = await db.exec(employeesDebtsQuery.concat(groupByEntity), parameters);

    // const notEmployeesDebtsTotal = await db.one(notEmployeesDebtsQuery, parameters);
    // const notEmployeesDebts = await db.exec(notEmployeesDebtsQuery.concat(groupByEntity), parameters);

    // const clientSupportDebtsTotal = await db.one(clientSupportDebtsQuery, parameters2);
    // const clientSupportDebts = await db.exec(clientSupportDebtsQuery.concat(groupByEntity), parameters2);

    const [
      patientsDebtsTotal,
      patientsDebts,
      employeesDebtsTotal,
      employeesDebts,
      notEmployeesDebtsTotal,
      notEmployeesDebts,
      clientSupportDebtsTotal,
      clientSupportDebts,
    ] = await Promise.all(
      db.one(patientsDebtsQuery, parameters),
      db.exec(patientsDebtsQuery.concat(groupByEntity), parameters),
      db.one(employeesDebtsQuery, parameters),
      db.exec(employeesDebtsQuery.concat(groupByEntity), parameters),
      db.one(notEmployeesDebtsQuery, parameters),
      db.exec(notEmployeesDebtsQuery.concat(groupByEntity), parameters),
      db.one(clientSupportDebtsQuery, parameters2),
      db.exec(clientSupportDebtsQuery.concat(groupByEntity), parameters2)
    );

    const result = await rpt.render({
      patientsDebtsTotal,
      patientsDebts,
      employeesDebtsTotal,
      employeesDebts,
      notEmployeesDebtsTotal,
      notEmployeesDebts,
      clientSupportDebtsTotal,
      clientSupportDebts,
      client,
      dateFrom,
      dateTo,
      showDetails,
    });

    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}
