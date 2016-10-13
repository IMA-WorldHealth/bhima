/**
 * @overview reports/registrations
 *
 * @description
 * This file contains code to create a PDF report of all patient registrations,
 * matching query conditions passed from the patient registry UI grid.
 *
 * @requires lodash
 * @requires Patients
 * @requires ReportManager
 */
'use strict';

const _ = require('lodash');

const ReportManager = require('../../../lib/ReportManager');

const Patients = require('../../medical/patients');

const Debtors = require('../debtors');

const TEMPLATE = './server/controllers/finance/reports/financial.patient.handlebars';

/**
 * @method build
 *
 * @description
 * This method builds the report of patient registrations to be shipped back to
 * the client.  This method will eventually use the Patients.search() method to
 * specify query conditions.
 *
 * GET /reports/patient/registrations
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

  Patients.lookupByDebtorUuid(req.params.uuid)
    .then(debtor => {
      debtorData.debtor = debtor;
      return Debtors.financialPatient(req.params.uuid)    
    })
    .then(patients => {
      let sum = {
        credit : 0,
        debit : 0,
        balance: 0
      };

      patients.forEach(function (patient) {
        sum.debit += patient.debit;
        sum.credit += patient.credit; 
        sum.balance = sum.debit - sum.credit;
      });
      const debtor = debtorData.debtor;
      return report.render({ patients, debtor, sum });
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

module.exports = build;
