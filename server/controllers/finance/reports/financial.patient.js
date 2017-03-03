/**
 * @overview server/controllers/finance/reports/financial.patient.js
 *
 * @description
 * This file contains code to create a PDF report for financial activities of a patient
 *
 * @requires Patients
 * @requires ReportManager
 */

const q = require('q');
const db = require('../../../lib/db');
const ReportManager = require('../../../lib/ReportManager');

const Patients = require('../../medical/patients');

const TEMPLATE = './server/controllers/finance/reports/financial.patient.handlebars';

/**
 * @method build
 *
 * @description
 * This method builds the report of financial activites of a patient
 *
 * GET reports/finance/financePatient/{:uuid}
 */
function build(req, res, next) {
  const options = req.query;
  let report;

  // set up the report with report manager
  try {
    report = new ReportManager(TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  return financialActivities(req.params.uuid)
    .then(result => report.render(result))
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

/**
 * @method financialActivities
 * Return details of financial activities of a given patient
 */
function financialActivities(debtorUuid) {
  const data = {};

  const sql = `

    SELECT trans_id, entity_uuid, description, record_uuid, trans_date, debit, credit, document,
      (@cumsum := balance + @cumsum) AS cumsum
    FROM (
      SELECT combined_ledger.trans_id, combined_ledger.entity_uuid, combined_ledger.description,
        combined_ledger.record_uuid, combined_ledger.trans_date, SUM(combined_ledger.debit_equiv) AS debit,
        SUM(combined_ledger.credit_equiv) AS credit, document_map.text AS document,
        (SUM(combined_ledger.debit_equiv) - SUM(combined_ledger.credit_equiv)) AS balance
      FROM combined_ledger
        LEFT JOIN document_map ON document_map.uuid = combined_ledger.record_uuid
      WHERE combined_ledger.entity_uuid = ?
      GROUP BY combined_ledger.record_uuid
      ORDER BY combined_ledger.trans_date ASC, combined_ledger.trans_id
    )c, (SELECT @cumsum := 0)z
    ORDER BY trans_date ASC, trans_id;
  `;

  const aggregateQuery = `
    SELECT SUM(combined_ledger.debit_equiv) AS debit, SUM(combined_ledger.credit_equiv) AS credit,
      SUM(combined_ledger.debit_equiv - combined_ledger.credit_equiv) AS balance
    FROM combined_ledger
    WHERE combined_ledger.entity_uuid = ?
    GROUP BY entity_uuid;
  `;

  return Patients.lookupByDebtorUuid(debtorUuid)
    .then((patient) => {
      data.patient = patient;
      const buid = db.bid(debtorUuid);
      return q.all([db.exec(sql, buid), db.one(aggregateQuery, buid)]);
    })
    .spread((transactions, aggregates) => {
      const patient = data.patient;
      aggregates.hasDebitBalance = aggregates.balance > 0;
      return { transactions, patient, aggregates };
    });
}

exports.financialActivities = financialActivities;
exports.report = build;
