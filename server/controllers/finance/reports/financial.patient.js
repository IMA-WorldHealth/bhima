/* eslint-disable prefer-destructuring */
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
const _ = require('lodash');
const ReportManager = require('../../../lib/ReportManager');

const Patients = require('../../medical/patients');
const Debtors = require('../debtors');

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
  data.includeStockDistributed = parseInt(options.include_stock_distributed, 10);

  return Patients.lookupPatient(req.params.uuid)
    .then(patient => {
      _.extend(data, { patient });
      const dbPromises = [
        Debtors.getFinancialActivity(patient.debtor_uuid, true),
      ];

      if (data.includeStockDistributed) {
        dbPromises.push(Patients.stockMovementByPatient(req.params.uuid));
      }

      return q.all(dbPromises);
    })
    .then(results => {
      const { transactions } = results[0];
      const { aggregates } = results[0];

      if (data.includeStockDistributed) {
        data.stockMovement = results[1];
      }

      aggregates.balanceText = aggregates.balance >= 0 ? 'FORM.LABELS.DEBIT_BALANCE' : 'FORM.LABELS.CREDIT_BALANCE';

      _.extend(data, { transactions, aggregates });
    })
    .then(() => report.render(data))
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}

exports.report = build;
