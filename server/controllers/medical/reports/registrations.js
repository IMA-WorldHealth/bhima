
/**
 * @overview reports/registrations
 *
 * @description
 * This file contains code to create a PDF report of all patient registrations,
 * matching query conditions passed from the patient registry UI grid.
 *
 * @requires lodash
 * @requires moment
 * @requires Patients
 * @requires ReportManager
 */

const _ = require('lodash');
const moment = require('moment');

const ReportManager = require('../../../lib/ReportManager');
const db = require('../../../lib/db');

const Patients = require('../patients');
const shared = require('../../finance/reports/shared');

const TEMPLATE = './server/controllers/medical/reports/registrations.handlebars';

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
  const options = _.clone(req.query);

  _.extend(options, { 
    filename : 'PATIENT_REG.PAGE_TITLE',
    csvKey : 'patients', 
    orientation : 'landscape',
    footerRight : '[page] / [toPage]',
    footerFontSize : '7',
  });

  let report;

  // set up the report with report manager
  try {
    report = new ReportManager(TEMPLATE, req.session, options);
    delete options.orientation;
  } catch (e) {
    next(e);
    return;
  }

  const filters = shared.formatFilters(options);

  // enforce detailed columns
  options.detailed = 1;

  const sql = `
    SELECT COUNT(patient.uuid) AS numPatients, MIN(patient.created_at) AS minDate, MAX(patient.created_at) AS maxDate,
      COUNT(DISTINCT(DATE(patient.created_at))) AS numDays,
      SUM(sex = 'F') AS numFemales, ROUND(SUM(sex = 'F') / COUNT(patient.uuid) * 100) AS percentFemales,
      SUM(sex = 'M') AS numMales, ROUND(SUM(sex = 'M') / COUNT(patient.uuid) * 100) AS percentMales,
      COUNT(DISTINCT(patient.current_location_id)) AS numDistinctResidences,
      COUNT(DISTINCT(debtor.group_uuid)) AS numDebtorGroups
    FROM patient JOIN debtor ON patient.debtor_uuid = debtor.uuid
    WHERE patient.uuid IN (?);
  `;

  const data = { filters };

  Patients.find(options)
    .then(patients => {
      // calculate ages with moment
      patients.forEach(patient => {
        patient.age = moment().diff(patient.dob, 'years');
      });


      data.patients = patients;


      // if no patients matched the previous query, set the promise value to false
      // and skip rendering aggregates in the handlbars view
      if (patients.length === 0) { return false; }

      // gather the uuids for the aggregate queries
      const uuids = patients.map(p => db.bid(p.uuid));

      return db.one(sql, [uuids]);
    })
    .then(aggregates => {
      data.aggregates = aggregates;
      return report.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

module.exports = build;
