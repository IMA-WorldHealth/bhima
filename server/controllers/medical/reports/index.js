/**
 * @overview medical/reports
 *
 * @description
 * This module simply exposes the build() methods of the receipts and reports
 * in the medical module.
 */

const patient = require('./patient.receipt').build;
const patientRegistration = require('./registrations');
const patientVisits = require('./visits');
const visitsReports = require('./visits.report');

// expose to the express router
module.exports = {
  receipts : {
    patients : patient,
  },
  patientRegistrations : patientRegistration,
  patientVisits,
  visitsReports,
};
