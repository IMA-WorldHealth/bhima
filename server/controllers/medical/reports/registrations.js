/**
 * @overview reports/registrations
 *
 * @description
 * This file contains code to create a PDF report of all patient registrations,
 * matching query conditions passed from the patient registry UI grid.
 *
 * @requires path
 * @requires lodash
 * @requires BadRequest
 * @requires Patients
 * @requires renderers/json
 * @requires renderers/html
 * @requires renderers/pdf
 */
'use strict';

const path = require('path');
const _ = require('lodash');

const BadRequest = require('../../../lib/errors/BadRequest');

const Patients = require('../patients');

// group supported renderers
const renderers = {
  'json': require('../../../lib/renderers/json'),
  'html': require('../../../lib/renderers/html'),
  'pdf': require('../../../lib/renderers/pdf'),
};

// default rendering parameters
const defaults = {
  pageSize: 'A4',
  renderer: 'pdf',
};

// path to the template to render
const template = path.normalize('./server/controllers/medical/reports/registrations.handlebars');

// translation key mappings for dynamic filters
// Basically, to show a pretty filter bar, this will translate URL query params
// into human-readable text to be placed in the report, showing the properties
// filtered on.
function formatFilters(qs) {
  const columns = [
    { field: 'name', displayName: 'FORM.LABELS.NAME' },
    { field: 'sex', displayName: 'FORM.LABELS.GENDER' },
    { field: 'hospital_no', displayName: 'FORM.LABELS.HOSPITAL_NO' },
    { field: 'reference', displayName: 'FORM.LABELS.REFERENCE' },
    { field: 'dateBirthFrom', displayName: 'FORM.LABELS.DOB', comparitor: '>', isDate: true },
    { field: 'dateBirthTo', displayName: 'FORM.LABELS.DOB', comparitor: '<', isDate: true },
    { field: 'dateRegistrationFrom', displayName: 'FORM.LABELS.DATE_REGISTRATION', comparitor: '>', isDate: true },
    { field: 'dateRegistrationTo', displayName: 'FORM.LABELS.DATE_REGISTRATION', comparitor: '<', isDate: true }
  ];

  return columns.filter(column => {
    let value = qs[column.field];

    if (!_.isUndefined(value)) {
      column.value = value;
      return true;
    } else {
      return false;
    }
  });
}

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
  const qs = req.query;

  // choose the renderer
  const renderer = renderers[qs.renderer || defaults.renderer];
  if (_.isUndefined(renderer)) {
    throw new BadRequest(`The application does not support rendering ${qs.renderer}.`);
  }

  // delete from the query string
  delete qs.renderer;

  const params = _.clone(qs);

  const metadata = {
    timestamp: new Date(),
    filters: formatFilters(qs)
  };

  // enforced detailed
  params.detailed = 1;

  Patients.find(params)
  .then(patients => renderer.render({ patients, metadata }, template, defaults))
  .then(result => {
    res.set(renderer.headers).send(result);
  })
  .catch(next)
  .done();
}

module.exports = build;
