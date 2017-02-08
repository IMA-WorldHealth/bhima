/**
 * @overview server/controllers/finance/reports/financial.patient.js
 *
 * @description
 * This file contains code to create a PDF report for financial activites of a patient
 *
 * @requires lodash
 * @requires Patients
 * @requires ReportManager
 * @requires Debtors
 */

const _ = require('lodash');

const ReportManager = require('../../../lib/ReportManager');

const Patients = require('../../medical/patients');

const Debtors = require('../debtors');

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
  let debtorData = {};
  let report;

  // set up the report with report manager
  try {
    report = new ReportManager(TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  // enforce detailed columns
  options.detailed = 1;

  financialActivities(req.params.uuid)
    .then(result => report.render(result))
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

/**
 * @method financialActivities
 * Return details of financial activites of a given patient
 */
function financialActivities(patientUuid) {
  let glb = {};

  return Patients.lookupByDebtorUuid(patientUuid)
    .then(debtor => {
      glb.debtor = debtor;
      return Debtors.financialPatient(patientUuid);
    })
    .then(patients => {
      let sum = {
        credit : 0,
        debit : 0,
        balance: 0
      };

      // why does this loop through patients?
      patients.forEach(function (patient) {
        sum.debit += patient.debit;
        sum.credit += patient.credit;
        sum.balance = sum.debit - sum.credit;
        sum.hasDebitBalance = sum.balance > 0;
        
        // Set value for Document Id from Invoice, Cash or Voucher
        patient.document = patient.reference ? patient.reference :
          patient.referenceCash ? patient.referenceCash :
          patient.referenceVoucher ? patient.referenceVoucher : null;  

      });

      const debtor = glb.debtor;
      return { patients, debtor, sum };
    });
}

exports.financialActivities = financialActivities;
exports.report = build;
