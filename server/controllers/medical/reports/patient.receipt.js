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
 * @requires path
 * @requires lodash
 * @requires lib/errors/BadRequest
 */

const Patients = require ('../patients');
const path = require('path');
const _ = require('lodash');

const BadRequest = require('../../../lib/errors/BadRequest');

// group supported renderers
const renderers = {
  'json': require('../../../lib/renderers/json'),
  'html': require('../../../lib/renderers/html'),
  'pdf': require('../../../lib/renderers/pdf'),
};

// default rendering parameters
const defaults = {
  pageSize: 'A6',
  renderer: 'pdf',
  orientation: 'landscape',
  lang: 'en'
};

const template = path.normalize('./server/controllers/medical/reports/patient.receipt.handlebars');

exports.build = build;

function build(req, res, next) {
  const qs = req.query;

  // choose the renderer
  const renderer = renderers[qs.renderer || defaults.renderer];
  if (_.isUndefined(renderer)) {
    return next(new BadRequest(`The application does not support rendering ${qs.renderer}.`));
  }

  // delete from the query string
  delete qs.renderer;

  const context = { lang : qs.lang };
  _.defaults(context, defaults);

  Patients.lookupPatient(req.params.uuid)
    .then(function (patient) {
      patient.enterprise_name = req.session.enterprise.name;
      patient.symbol = (patient.sex === 'M') ? 'mars' : 'venus';
      return renderer.render({ patient }, template, context);
    })
    .then(function (result) {
      res.set(renderer.headers).send(result);
    })
    .catch(next)
    .done();
}
