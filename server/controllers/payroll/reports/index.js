/**
 * @overview payroll/reports
 *
 * @description
 * This module simply exposes interfaces for employee reports
 * in the payroll module.
 */

const employeeRegistration = require('./registrations');
// expose to the express router
module.exports = {
  employeeRegistrations : employeeRegistration,
};
