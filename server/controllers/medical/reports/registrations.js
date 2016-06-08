/**
 * @overview reports/registrations
 *
 * @description
 * This file contains code to create a PDF report of all patient registrations.
 *
 * @requires path
 * @requires db
 * @requires lodash
 * @requires BadRequest
 * @requires renderers/json
 * @requires renderers/html
 * @requires renderers/pdf
 */

const path = require('path');
const _ = require('lodash');
const BadRequest = require('../../../lib/errors/BadRequest');
const Patients = require('../../../controllers/patients');

// group supported renderers
const renderers = {
  'json': require('../../../lib/renderers/json'),
  'html': require('../../../lib/renderers/html'),
  'pdf': require('../../../lib/renderers/pdf'),
};

const defaults = {
  pageSize : 'A4',
  orientation : 'landscape',
  renderer : 'pdf'
};

const template = path.normalize('./server/controllers/medical/reports/registrations.handlebars');

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

  Patients.find(qs)
  .then(patients => renderer.render({ patients, metadata: qs }, template, defaults))
  .then(result => {
    res.set(renderer.headers).send(result);
  })
  .catch(next)
  .done();
}

