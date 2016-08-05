/**
 * @overview medical/reports
 *
 * @description
 * This module simply exposes the build() methods of the receipts and reports
 * in the medical module.
 */

// expose to the express router
module.exports = {
  receipts: {
    patients: require('./patient.receipt').build,
  },
  patientRegistrations : require('./registrations'),
  patientCheckins : require('./checkins')
};
