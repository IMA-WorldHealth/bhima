'use strict';

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

const Patients = require ('../patients');
const _ = require('lodash');
const ReportManager = require('../../../lib/ReportManager');
const Locations = require('../../admin/locations');

const pdf = require ('../../../lib/renderers/pdf');

const CARD_TEMPLATE  = './server/controllers/medical/reports/patient.receipt.handlebars';
const POS_TEMPLATE = './server/controllers/medical/reports/patient.pos.handlebars';

// default options for the patient card
const defaults = {
  pageSize : 'A6',
  orientation: 'landscape',
};

exports.build = build;

function build(req, res, next) {
  const qs = req.query;
  const options = _.defaults(defaults, qs);

  let report;
  let template;

  // if the POS option is selected, render a thermal receipt.
  if (options.posReceipt) {
    _.assign(options, pdf.posReceiptOptions);
    template = POS_TEMPLATE;
  } else {
    template = CARD_TEMPLATE;
  }

  try {
    report = new ReportManager(template, req.params, options);
  } catch (e) {
    return next(e);
  }

  const data = {};

  Patients.lookupPatient(req.params.uuid)
    .then(patient => {
      patient.enterprise_name = req.session.enterprise.name;
      patient.symbol = (patient.sex === 'M') ? 'mars' : 'venus';

      data.patient = patient;
      return Locations.lookupVillage(patient.origin_location_id);
    })
    .then(village => {
      data.village = village;
      return report.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}
