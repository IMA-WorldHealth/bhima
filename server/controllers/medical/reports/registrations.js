'use strict';

/**
 * @overview reports/registrations
 *
 * @description
 * This file contains code to create a PDF report of all patient registrations,
 * matching query conditions passed from the patient registry UI grid.
 *
 * @requires lodash
 * @requires Patients
 * @requires ReportManager
 */

const _ = require('lodash');

const ReportManager = require('../../../lib/ReportManager');

const Patients = require('../patients');

const TEMPLATE = './server/controllers/medical/reports/registrations.handlebars';

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
  const options = _.extend(req.query, { csvKey : 'patients' });

  let report;

  // set up the report with report manager
  try {
    report = new ReportManager(TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  const filters = formatFilters(options);

  // enforce detailed columns
  options.detailed = 1;

  Patients.find(options)
    .then(patients => {
      return report.render({ patients, filters });
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

module.exports = build;
