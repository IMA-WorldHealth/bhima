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

const _ = require('lodash');
const Patients = require('../patients');
const ReportManager = require('../../../lib/ReportManager');
const Locations = require('../../admin/locations');
const pdf = require('../../../lib/renderers/pdf');

// detailed patient identification - flag to determine if small or larger form
const CARD_TEMPLATE = './server/controllers/medical/reports/patient.receipt.handlebars';

// POS receipt, quick proof of registration
const POS_TEMPLATE = './server/controllers/medical/reports/patient.pos.handlebars';

// default options for the patient card
const defaults = {
  format : 'A6',
  landscape : true,
};

exports.build = build;

function build(req, res, next) {
  const qs = req.query;
  const options = _.defaults(qs, defaults);

  let report;
  let template = CARD_TEMPLATE;

  const requestedPOSReceipt = Boolean(Number(options.posReceipt));
  const requestedSimplifiedCard = Boolean(Number(options.simplified));

  // if the POS option is selected, render a thermal receipt.
  if (requestedPOSReceipt) {
    _.assign(options, pdf.posReceiptOptions);
    template = POS_TEMPLATE;
  } else if (requestedSimplifiedCard) {
    // not a point of sale receipt - check to see if the client has requested a simplified card
    _.assign(options, pdf.reducedCardOptions);
  }

  try {
    report = new ReportManager(template, req.params, options);
  } catch (e) {
    next(e);
    return;
  }

  const data = {};

  Patients.lookupPatient(req.params.uuid)
    .then(patient => {
      patient.enterprise_name = req.session.enterprise.name;
      patient.sexFormatted = (patient.sex === 'M') ? 'FORM.LABELS.MALE' : 'FORM.LABELS.FEMALE';

      data.patient = patient;
      return Promise.all([
        Locations.lookupVillage(patient.origin_location_id),
        Locations.lookupVillage(patient.current_location_id),
      ]);
    })
    .then(([village, currentVillage]) => {
      data.village = village;
      data.currentVillage = currentVillage;
      data.simplified = requestedSimplifiedCard;
      return report.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}
