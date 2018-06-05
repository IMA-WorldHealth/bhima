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
const ReportManager = require('../../../lib/ReportManager');

const Patients = require('../../medical/patients');
const Debtors = require('../../finance/debtors');

const TEMPLATE = './server/controllers/finance/reports/financial.patient.handlebars';

const PDF_OPTIONS = {
  filename : 'FORM.LABELS.FINANCIAL_STATUS',
};

/**
 * @method build
 *
 * @description
 * This method builds the report of financial activities of a patient.
 *
 * GET reports/finance/financePatient/{:uuid}
 */
function build(req, res, next) {
  const options = req.query;
  let report;

  _.defaults(options, PDF_OPTIONS);

  // set up the report with report manager
  try {
    report = new ReportManager(TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  const data = {};

  return Patients.lookupPatient(req.params.uuid)
    .then(patient => {
      _.extend(data, { patient });
      return Debtors.getFinancialActivity(patient.debtor_uuid);
    })
    .then(({ transactions, aggregates }) => {
      aggregates.balanceText = aggregates.balance >= 0 ? 'FORM.LABELS.DEBIT_BALANCE' : 'FORM.LABELS.CREDIT_BALANCE';

      _.extend(data, { transactions, aggregates });
    })
    .then(() => report.render(data))
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

exports.report = build;
