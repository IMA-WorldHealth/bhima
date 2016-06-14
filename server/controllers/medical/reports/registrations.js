/**
 * @overview reports/registrations
 *
 * @description
 * This file contains code to create a PDF report of all patient registrations,
 * matching query conditions passed from the patient registry UI grid.
 *
 * @requires path
 * @requires db
 * @requires lodash
 * @requires BadRequest
 * @requires Patients
 * @requires renderers/json
 * @requires renderers/html
 * @requires renderers/pdf
 */

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
// TODO - make sure this is translated before being handed to the report.
const qsTranslations = {
  'reference' : 'TABLE.COLUMNS.REFERENCE',
  'name' : 'TABLE.COLUMNS.NAME',
  'dob' : 'TABLE.COLUMNS.DOB',
  'sex' : 'TABLE.COLUMNS.GENDER',
  'hospital_no' : 'TABLE.COLUMNS.HOSPITAL_FILE_NR',
  'date_registered' : 'TABLE.COLUMNS.DATE_REGISTRATED',
};

/**
 * @method build
 *
 * @description
 * This method builds the report of patient registrations to be shipped back to
 * the client.  This method will eventually use the Patients.search() method to
 * specify query conditions.
 *
 * GET /reports/registrations
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

  // clone the query string filters for "metadata"
  const metadata = {
    filters: _.clone(qs),
    timestamp: new Date(),
    filtersI18n: qsTranslations
  };

  // enforced detailed
  qs.detailed = 1;

  Patients.find(qs)
  .then(patients => renderer.render({ patients, metadata }, template, defaults))
  .then(result => {
    res.set(renderer.headers).send(result);
  })
  .catch(next)
  .done();
}

module.exports = build;
