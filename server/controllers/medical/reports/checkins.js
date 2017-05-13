/**
 * @overview reports/checkins
 *
 * @description
 * This file contains code to create a PDF report of all patient checkins,
 * matching query conditions passed from the patient registry UI grid.
 *
 * @requires lodash
 * @requires lib/db
 * @requires lib/ReportManager
 * @requires Patients
 * @requires Locations
 */

const _ = require('lodash');

const db = require('../../../lib/db');
const ReportManager = require('../../../lib/ReportManager');

const Locations = require('../../admin/locations');
const Patients = require('../patients');

// path to the template to render
const TEMPLATE = './server/controllers/medical/reports/checkins.handlebars';

/**
 * @function getReportData
 *
 * @description
 * Compiles the data for the checkin report from the patient table and previous
 * checkins.
 *
 * @param {String} uuid - the patient uuid to look up
 */
function getReportData(uuid) {
  // data to be passed to the report
  const data = {
    metadata : { timestamp : new Date() },
  };

  return Patients.lookupPatient(uuid)
    .then(patient => {
      data.patient = patient;

      // make sure the patient year is set properly
      data.patient.year = new Date(patient.registration_date).getFullYear();

      // allow logical switches in patient sex
      data.patient.isMale = patient.sex === 'M';

      return Locations.lookupVillage(patient.origin_location_id);
    })
    .then(location => {
      // bind location
      data.location = location;

      const sql = `
        SELECT BUID(patient_uuid) AS patient_uuid, start_date, YEAR(start_date) AS year,
          end_date, user.display_name
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
  const options = req.query;

  let report;

  try {
    report = new ReportManager(TEMPLATE, req.session, options);
  } catch (e) {
    next(e);
    return;
  }

  // gather data and template into report
  getReportData(req.params.uuid)
    .then(data => report.render(data))
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

module.exports = build;
