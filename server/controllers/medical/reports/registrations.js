
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

const PeriodService = require('../../../lib/period');
const Patients = require('../patients');

const TEMPLATE = './server/controllers/medical/reports/registrations.handlebars';

// translation key mappings for dynamic filters
// Basically, to show a pretty filter bar, this will translate URL query params
// into human-readable text to be placed in the report, showing the properties
// filtered on.
function formatFilters(qs) {
  const columns = [
    { field : 'name', displayName : 'FORM.LABELS.NAME' },
    { field : 'sex', displayName : 'FORM.LABELS.GENDER' },
    { field : 'hospital_no', displayName : 'FORM.LABELS.HOSPITAL_NO' },
    { field : 'reference', displayName : 'FORM.LABELS.REFERENCE' },
    { field : 'dateBirthFrom', displayName : 'FORM.LABELS.DOB', comparitor : '>', isDate : true },
    { field : 'dateBirthTo', displayName : 'FORM.LABELS.DOB', comparitor : '<', isDate : true },
    { field : 'dateRegistrationFrom', displayName : 'FORM.LABELS.DATE_REGISTRATION', comparitor : '>', isDate : true },
    { field : 'dateRegistrationTo', displayName : 'FORM.LABELS.DATE_REGISTRATION', comparitor : '<', isDate : true },
    { field : 'debtor_group_uuid', displayName : 'FORM.LABELS.DEBTOR_GROUP' },
    { field : 'patient_group_uuid', displayName : 'PATIENT_GROUP.PATIENT_GROUP' },
    { field : 'user_id', displayName : 'FORM.LABELS.USER' },
    { field : 'limit', displayName : 'FORM.LABELS.LIMIT' },
    { field : 'period', displayName : 'TABLE.COLUMNS.PERIOD', isPeriod : true },
  ];

  return columns.filter(column => {

    const value = qs[column.field];

    if (!_.isUndefined(value)) {

      if (column.isPeriod) {
        const service = new PeriodService(new Date());
        column.value = service.periods[value].translateKey;
      } else {
        column.value = value;
      }
      return true;
    }
    return false;
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
  const options = _.clone(req.query);

  _.extend(options, { filename : 'PATIENT_REG.PAGE_TITLE', csvKey : 'patients', orientation : 'landscape' });

  let report;

  // set up the report with report manager
  try {
    report = new ReportManager(TEMPLATE, req.session, options);
    delete options.orientation;
  } catch (e) {
    next(e);
    return;
  }

  const filters = formatFilters(options);
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
