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
const _ = require('lodash');
const ReportManager = require('../../../lib/ReportManager');

const Patients = require('../../medical/patients');
const Debtors = require('../debtors');
const DebtorGroups = require('../debtors/groups');

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

  function getTxnIndexOfDate(array, date) {
    let i = 0;
    while (i < array.length) {
      if (array[i].created_at > date) { break; }
      i++;
    }
    return i;
  }

  return Patients.lookupPatient(req.params.uuid)
    .then(patient => {
      _.extend(data, { patient });
      const dbPromises = [
        Debtors.getFinancialActivity(patient.debtor_uuid, true),
        DebtorGroups.getDebtorGroupHistory(patient.debtor_uuid),
      ];

      if (data.includeStockDistributed) {
        dbPromises.push(Patients.stockMovementByPatient(req.params.uuid));
        dbPromises.push(Patients.stockConsumedPerPatient(req.params.uuid));
      }

      return Promise.all(dbPromises);
    })
    .then(([financial, history, stockMovement, stockConsumed]) => {
      const { transactions, aggregates } = financial;
      data.totalAllMovement = 0;

      // interleave the debtor group history changes with the transactions
      history.forEach(row => {
        const index = getTxnIndexOfDate(transactions, row.created_at);
        row.isChangeGroup = true;
        transactions.splice(index, 0, row);
      });

      if (data.includeStockDistributed) {
        data.stockMovement = stockMovement;
        data.stockMovement.forEach(item => {
          item.consumed = stockConsumed
            .filter(inv => item.hrReference === inv.reference_text);
          data.totalAllMovement += item.value;
        });
      }

      aggregates.balanceText = aggregates.balance >= 0 ? 'FORM.LABELS.DEBIT_BALANCE' : 'FORM.LABELS.CREDIT_BALANCE';

      _.extend(data, { transactions, aggregates });
      return report.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}

exports.report = build;
