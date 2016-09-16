/**
 * @module reports/patient.receipt
 *
 * @description
 * This module provides rendering for the patient receipt: a patient card.
 * A new patient card is automatically generated when the patient is registered
 * at the Patient Registration module.  Additionally, copies can be printed from
 * the Patient Record page.
 *
 * @requires Patients
 * @requires lodash
 * @requires lib/ReportManager
 */
'use strict';

const Patients = require ('../patients');
const _ = require('lodash');
const ReportManager = require('../../../lib/ReportManager');

const template = './server/controllers/medical/reports/patient.receipt.handlebars';

exports.build = build;

function build(req, res, next) {
  const qs = req.query;
  const options = _.defaults({ pageSize : 'A6', orientation: 'landscape' }, qs);

  let report;

  try {
    report = new ReportManager(template, req.params, options);
  } catch (e) {
    return next(e);
  }

  Patients.lookupPatient(req.params.uuid)
    .then(patient => {
      patient.enterprise_name = req.session.enterprise.name;
      patient.symbol = (patient.sex === 'M') ? 'mars' : 'venus';

      return report.render({ patient });
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}
