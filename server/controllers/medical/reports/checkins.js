/**
 * @overview reports/checkins
 *
 * @description
 * This file contains code to create a PDF report of all patient checkins,
 * matching query conditions passed from the patient registry UI grid.
 *
 * @requires path
 * @requires lodash
 * @requires BadRequest
 * @requires db
 * @requires renderers/json
 * @requires renderers/html
 * @requires renderers/pdf
 */
'use strict';

const path = require('path');
const _ = require('lodash');

const BadRequest = require('../../../lib/errors/BadRequest');
const db = require('../../../lib/db');
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
  lang : 'en'
};

// path to the template to render
const template = path.normalize('./server/controllers/medical/reports/checkins.handlebars');

function getReportData(uuid) {

  const data = {
    metadata : { timestamp : new Date() }
  };

  return Patients.lookupPatient(uuid)
    .then(patient => {
      data.patient = patient;

      const sql = `
        SELECT BUID(patient_uuid) AS patient_uuid, start_date, YEAR(start_date) AS year,
          end_date, CONCAT(user.first, ' ' , user.last) AS displayName
        FROM patient_visit
        JOIN user ON patient_visit.user_id = user.id
        WHERE patient_uuid = ?
        ORDER BY start_date;
      `;

      return db.exec(sql, [db.bid(uuid)]);
    })
    .then(checkins => {

      // grouping by year allows pretty table groupings
      data.checkins = _.groupBy(checkins, 'year');
      data.total = checkins.length;

      return data;
    });
}

/**
 * @method build
 *
 * @description
 * This function builds a patient checkin report.  The checkin report begins
 * with the patient registration and lists all checkins since the initial
 * registration.
 *
 * GET /reports/patients/:uuid/checkins
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

  // create the correct context by setting the language and inheriting defaults
  const context = { lang : qs.lang };
  _.defaults(context, defaults);

  getReportData(req.params.uuid)
  .then(data => renderer.render(data, template, context))
  .then(result => {
    res.set(renderer.headers).send(result);
  })
  .catch(next)
  .done();
}

module.exports = build;
