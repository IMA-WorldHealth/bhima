/**
 * @overview server/controllers/finance/reports/financial.patient.js
 *
 * @description
 * This file contains code to create a PDF report for financial activities of a patient
 *
 * @requires Patients
 * @requires ReportManager
 */

const _ = require('lodash');
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
      SELECT p.trans_id, p.entity_uuid, p.description, p.record_uuid, p.trans_date,
        SUM(p.debit_equiv) AS debit, SUM(p.credit_equiv) AS credit, dm.text AS document,
        SUM(p.debit_equiv) - SUM(p.credit_equiv) AS balance
      FROM posting_journal AS p
        LEFT JOIN document_map AS dm ON dm.uuid = p.record_uuid
      WHERE p.entity_uuid = ?
      GROUP BY p.record_uuid

      UNION ALL

      SELECT g.trans_id, g.entity_uuid, g.description, g.record_uuid, g.trans_date,
        SUM(g.debit_equiv) AS debit, SUM(g.credit_equiv) AS credit, dm.text AS document,
        SUM(g.debit_equiv) - SUM(g.credit_equiv) AS balance
      FROM general_ledger AS g
        LEFT JOIN document_map AS dm ON dm.uuid = g.record_uuid
      WHERE g.entity_uuid = ?
      GROUP BY g.record_uuid
    )c, (SELECT @cumsum := 0)z
    ORDER BY trans_date ASC, trans_id;
  `;

  const aggregateQuery = `
    SELECT IFNULL(SUM(ledger.debit_equiv), 0) AS debit, IFNULL(SUM(ledger.credit_equiv), 0) AS credit,
      IFNULL(SUM(ledger.debit_equiv - ledger.credit_equiv), 0) AS balance
    FROM (
      SELECT debit_equiv, credit_equiv, entity_uuid FROM posting_journal WHERE entity_uuid = ?
      UNION ALL
      SELECT debit_equiv, credit_equiv, entity_uuid FROM general_ledger WHERE entity_uuid = ?
    ) AS ledger
    GROUP BY ledger.entity_uuid;
  `;

  return Patients.lookupByDebtorUuid(debtorUuid)
    .then((patient) => {
      data.patient = patient;
      const buid = db.bid(debtorUuid);
      return q.all([
        db.exec(sql, [buid, buid]),
        db.exec(aggregateQuery, [buid, buid]),
      ]);
    })
    .spread((transactions, aggs) => {
      let aggregates = aggs;
      const patient = data.patient;

      if (!aggregates.length) {
        aggregates = { balance : 0 };
      } else {
        aggregates = aggregates[0];
      }

      _.extend(aggregates, { hasDebitBalance : aggregates.balance > 0 });
      return { transactions, patient, aggregates };
    });
}

exports.financialActivities = financialActivities;
exports.report = build;
